import mongoose from 'mongoose'
const { ValidationError } = mongoose.Error
import { ObjectId } from 'mongodb'
import { expect } from 'chai'
import Statistic, { IStatisticDocument } from '../../../src/models/statistic'
import User from '../../../src/models/user'

describe('Statistic model', () => {
  let stat: IStatisticDocument
  let statData: IStatisticDocument
  let user: ReturnType<typeof User.prototype.toObject>

  beforeEach(async () => {
    user = await new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testPassword123'
    }).save()

    statData = new Statistic({
      name: 'Goals Completed',
      total: 85,
      sign: '%',
      icon: ['fas', 'trophy'],
      color: '#b39700',
      description: 'Percentage of goals completed this month',
      userId: user._id
    })

    stat = await statData.save()
  })

  describe('Save', () => {
    describe('with valid data', () => {
      it('should be saved successfully', () => {
        expect(stat).to.have.property('_id')
        expect(stat).to.be.an.instanceOf(Statistic)
        expect(stat.name).to.equal(statData.name)
        expect(stat.total).to.equal(85)
        expect(stat.sign).to.equal('%')
        expect(stat.icon).to.deep.equal(['fas', 'trophy'])
        expect(stat.color).to.equal('#b39700')
        expect(stat.description).to.equal('Percentage of goals completed this month')
        expect(stat.userId.toString()).to.equal(String(user._id))
      })

      it('should save with default null values', async () => {
        const minimalStat = new Statistic({
          name: 'Simple Stat',
          total: 10,
          icon: ['fas', 'star'],
          userId: user._id
        })

        const saved = await minimalStat.save()

        expect(saved.sign).to.be.null
        expect(saved.color).to.be.null
        expect(saved.description).to.be.null
      })
    })

    describe('with invalid data', () => {
      it('with missing name, then should fail', async () => {
        let err: Error | undefined
        statData.name = undefined as unknown as string

        try {
          await statData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.name).to.exist
      })

      it('with missing total, then should fail', async () => {
        let err: Error | undefined
        statData.total = undefined as unknown as number

        try {
          await statData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.total).to.exist
      })

      it('with missing icon, then should fail', async () => {
        let err: Error | undefined
        statData.icon = undefined as unknown as unknown[]

        try {
          await statData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.icon).to.exist
      })

      it('with missing userId, then should fail', async () => {
        let err: Error | undefined
        statData.userId = undefined as unknown as mongoose.Types.ObjectId

        try {
          await statData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.userId).to.exist
      })
    })
  })

  describe('Find', () => {
    it('should be found successfully', async () => {
      const found = await Statistic.findOne({ _id: new ObjectId(String(stat._id)) })

      expect(found).to.have.property('_id')
      expect(found).to.be.an.instanceOf(Statistic)
      expect(found!.name).to.equal(statData.name)
      expect(found!.total).to.equal(85)
    })

    it('should find by userId', async () => {
      const found = await Statistic.find({ userId: new ObjectId(String(user._id)) })

      expect(found).to.be.an('array')
      expect(found).to.have.lengthOf(1)
      expect(found[0].name).to.equal(statData.name)
    })
  })

  describe('transform', () => {
    it('should convert _id to numeric id', () => {
      const transformed = stat.transform()

      expect(transformed).to.have.property('id')
      expect(transformed.id).to.be.a('number')
      expect(transformed.id as number).to.be.greaterThan(0)
      expect(transformed).to.not.have.property('_id')
    })

    it('should convert total to string', () => {
      const transformed = stat.transform()

      expect(transformed.total).to.be.a('string')
      expect(transformed.total).to.equal('85')
    })

    it('should remove userId and __v', () => {
      const transformed = stat.transform()

      expect(transformed).to.not.have.property('userId')
      expect(transformed).to.not.have.property('__v')
    })

    it('should preserve other fields', () => {
      const transformed = stat.transform()

      expect(transformed.name).to.equal('Goals Completed')
      expect(transformed.sign).to.equal('%')
      expect(transformed.icon).to.deep.equal(['fas', 'trophy'])
      expect(transformed.color).to.equal('#b39700')
      expect(transformed.description).to.equal('Percentage of goals completed this month')
    })

    it('should provide default empty string for null sign', async () => {
      const statWithNullSign = await new Statistic({
        name: 'Count',
        total: 42,
        icon: ['fas', 'hashtag'],
        userId: user._id
      }).save()

      const transformed = statWithNullSign.transform()

      expect(transformed.sign).to.equal('')
    })

    it('should provide default color for null color', async () => {
      const statWithNullColor = await new Statistic({
        name: 'Count',
        total: 42,
        icon: ['fas', 'hashtag'],
        userId: user._id
      }).save()

      const transformed = statWithNullColor.transform()

      expect(transformed.color).to.equal('#000000')
    })

    it('should provide default empty string for null description', async () => {
      const statWithNullDesc = await new Statistic({
        name: 'Count',
        total: 42,
        icon: ['fas', 'hashtag'],
        userId: user._id
      }).save()

      const transformed = statWithNullDesc.transform()

      expect(transformed.description).to.equal('')
    })
  })
})
