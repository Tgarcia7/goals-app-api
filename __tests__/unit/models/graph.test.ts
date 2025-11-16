import mongoose from 'mongoose'
const { ValidationError } = mongoose.Error
import { ObjectId } from 'mongodb'
import { expect } from 'chai'
import Graph, { IGraphDocument } from '../../../src/models/graph'
import User from '../../../src/models/user'

describe('Graph model', () => {
  let graph: IGraphDocument
  let graphData: IGraphDocument
  let user: ReturnType<typeof User.prototype.toObject>

  beforeEach(async () => {
    user = await new User({
      name: 'Test User',
      email: 'graphuser@example.com',
      password: 'testPassword123'
    }).save()

    graphData = new Graph({
      title: 'Monthly Progress',
      type: 'Bar',
      byYear: false,
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      data: [10, 20, 30, 25, 40],
      userId: user._id
    })

    graph = await graphData.save()
  })

  describe('Save', () => {
    describe('with valid data', () => {
      it('should be saved successfully', () => {
        expect(graph).to.have.property('_id')
        expect(graph).to.be.an.instanceOf(Graph)
        expect(graph.title).to.equal('Monthly Progress')
        expect(graph.type).to.equal('Bar')
        expect(graph.byYear).to.equal(false)
        expect(graph.labels).to.deep.equal(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
        expect(graph.data).to.deep.equal([10, 20, 30, 25, 40])
        expect(graph.userId.toString()).to.equal(String(user._id))
      })

      it('should save with byYear data structure', async () => {
        const yearGraph = new Graph({
          title: 'Yearly Comparison',
          type: 'Line',
          byYear: true,
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          data: {
            '2023': [100, 150, 200, 180],
            '2024': [120, 180, 220, 250]
          },
          userId: user._id
        })

        const saved = await yearGraph.save()

        expect(saved.byYear).to.equal(true)
        const data = saved.data as Record<string, unknown[]>
        expect(data['2023']).to.deep.equal([100, 150, 200, 180])
        expect(data['2024']).to.deep.equal([120, 180, 220, 250])
      })

      it('should save Doughnut chart type', async () => {
        const doughnutGraph = new Graph({
          title: 'Goal Distribution',
          type: 'Doughnut',
          labels: ['Completed', 'In Progress', 'Not Started'],
          data: [45, 30, 25],
          userId: user._id
        })

        const saved = await doughnutGraph.save()

        expect(saved.type).to.equal('Doughnut')
      })

      it('should default byYear to false', async () => {
        const minimalGraph = new Graph({
          title: 'Simple Graph',
          type: 'Line',
          labels: ['A', 'B'],
          data: [1, 2],
          userId: user._id
        })

        const saved = await minimalGraph.save()

        expect(saved.byYear).to.equal(false)
      })
    })

    describe('with invalid data', () => {
      it('with missing title, then should fail', async () => {
        let err: Error | undefined
        graphData.title = undefined as unknown as string

        try {
          await graphData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.title).to.exist
      })

      it('with missing type, then should fail', async () => {
        let err: Error | undefined
        graphData.type = undefined as unknown as string

        try {
          await graphData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.type).to.exist
      })

      it('with missing labels, then should fail', async () => {
        let err: Error | undefined
        graphData.labels = undefined as unknown as unknown[]

        try {
          await graphData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.labels).to.exist
      })

      it('with missing data, then should fail', async () => {
        let err: Error | undefined
        graphData.data = undefined as unknown as Record<string, unknown>

        try {
          await graphData.save()
        } catch (error) {
          err = error as Error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as mongoose.Error.ValidationError).errors.data).to.exist
      })

      it('with missing userId, then should fail', async () => {
        let err: Error | undefined
        graphData.userId = undefined as unknown as mongoose.Types.ObjectId

        try {
          await graphData.save()
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
      const found = await Graph.findOne({ _id: new ObjectId(String(graph._id)) })

      expect(found).to.have.property('_id')
      expect(found).to.be.an.instanceOf(Graph)
      expect(found!.title).to.equal('Monthly Progress')
      expect(found!.type).to.equal('Bar')
    })

    it('should find by userId', async () => {
      const found = await Graph.find({ userId: new ObjectId(String(user._id)) })

      expect(found).to.be.an('array')
      expect(found).to.have.lengthOf(1)
      expect(found[0].title).to.equal('Monthly Progress')
    })
  })

  describe('transform', () => {
    it('should convert _id to numeric id', () => {
      const transformed = graph.transform()

      expect(transformed).to.have.property('id')
      expect(transformed.id).to.be.a('number')
      expect(transformed.id as number).to.be.greaterThan(0)
      expect(transformed).to.not.have.property('_id')
    })

    it('should remove userId and __v', () => {
      const transformed = graph.transform()

      expect(transformed).to.not.have.property('userId')
      expect(transformed).to.not.have.property('__v')
    })

    it('should preserve graph data fields', () => {
      const transformed = graph.transform()

      expect(transformed.title).to.equal('Monthly Progress')
      expect(transformed.type).to.equal('Bar')
      expect(transformed.byYear).to.equal(false)
      expect(transformed.labels).to.deep.equal(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
      expect(transformed.data).to.deep.equal([10, 20, 30, 25, 40])
    })

    it('should preserve byYear data structure', async () => {
      const yearGraph = await new Graph({
        title: 'Yearly',
        type: 'Line',
        byYear: true,
        labels: ['Q1', 'Q2'],
        data: {
          '2023': [100, 150],
          '2024': [120, 180]
        },
        userId: user._id
      }).save()

      const transformed = yearGraph.transform()
      const data = transformed.data as Record<string, unknown[]>

      expect(transformed.byYear).to.equal(true)
      expect(data['2023']).to.deep.equal([100, 150])
      expect(data['2024']).to.deep.equal([120, 180])
    })
  })
})
