import { Error as MongooseError } from 'mongoose'
import { ObjectId } from 'mongodb'
import { expect } from 'chai'
import User, { IUserDocument } from '../../../src/models/user'

const { ValidationError } = MongooseError

describe('User model', () => {
  let user: IUserDocument
  let userData: IUserDocument

  beforeEach(async () => {
    userData = new User({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'badPassword'
    })

    user = await userData.save()
  })

  describe('Save', () => {
    describe('with valid data', () => {
      it('should be saved successfully', () => {
        expect(user).to.have.property('_id')
        expect(user).to.have.property('password')
        expect(user).to.be.an.instanceOf(User)
        expect(user.name).to.equal(userData.name)
        expect(user.email).to.equal(userData.email)
        expect(user.admin).to.be.equal(0)
        expect(user.signupDate).to.be.an.instanceOf(Date)
        expect(user.status).to.be.equal(1)
        expect(user.lang).to.be.equal('es')
      })

      it('should lowercase email', () => {
        userData.email = userData.email.toUpperCase()
        expect(user.email).to.equal('johndoe@example.com')
      })
    })

    describe('with invalid data', () => {
      it('with empty field, then should fail', async () => {
        let err: unknown
        userData.password = ''

        try {
          await userData.save()
        } catch (error) {
          err = error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as MongooseError.ValidationError).errors.password).to.exist
      })

      it('with missing field, then should fail', async () => {
        let err: unknown
        userData.name = undefined as unknown as string

        try {
          await userData.save()
        } catch (error) {
          err = error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as MongooseError.ValidationError).errors.name).to.exist
      })

      it('with wrong status, then should fail', async () => {
        let err: unknown
        userData.status = 2

        try {
          await userData.save()
        } catch (error) {
          err = error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as MongooseError.ValidationError).errors.status).to.exist
      })

      it('with wrong lang, then should fail', async () => {
        let err: unknown
        userData.lang = 'ch' as 'es' | 'en'

        try {
          await userData.save()
        } catch (error) {
          err = error
        }

        expect(err).to.exist
        expect(err).to.be.instanceOf(ValidationError)
        expect((err as MongooseError.ValidationError).errors.lang).to.exist
      })

      it('with repeated email, then should fail', async () => {
        let err: unknown
        const newUserData = new User({
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'badPassword'
        })

        try {
          await newUserData.save()
        } catch (error) {
          err = error
        }

        expect(err).to.exist
        expect((err as { code: number }).code).to.equal(11000) // MongoDB duplicate key error code
        expect((err as { keyValue: Record<string, unknown> }).keyValue['email']).to.exist
      })
    })
  })

  describe('Find', () => {
    it('should be found successfully', async () => {
      const userFound = await User.findOne({ _id: new ObjectId(String(user._id)) })

      expect(userFound).to.have.property('_id')
      expect(userFound).to.have.property('password')
      expect(userFound).to.be.an.instanceOf(User)
      expect(userFound!.name).to.equal(userData.name)
      expect(userFound!.email).to.equal(userData.email)
      expect(userFound!.admin).to.be.equal(0)
      expect(userFound!.signupDate).to.be.an.instanceOf(Date)
      expect(userFound!.lang).to.be.equal('es')
    })
  })

  describe('Update', () => {
    it('should be updated successfully', async () => {
      user.name = 'Bruce willis'
      user.email = 'bruce@example.com'
      user.lang = 'en'
      await user.save()

      await User.updateOne({ _id: new ObjectId(String(user._id)) }, userData)
      const updatedUser = await User.findOne({ _id: new ObjectId(String(user._id)) })

      expect(updatedUser!.name).to.equal(userData.name)
      expect(updatedUser!.email).to.equal(userData.email)
      expect(updatedUser!.admin).to.be.equal(0)
      expect(updatedUser!.signupDate).to.be.an.instanceOf(Date)
      expect(updatedUser!.lang).to.be.equal('en')
    })
  })

  describe('Delete', () => {
    it('should be deleted successfully', async () => {
      await User.deleteOne({ _id: new ObjectId(String(user._id)) })
      const result = await User.find({ _id: new ObjectId(String(user._id)) })

      expect(result).to.be.empty
    })
  })

  describe('Compare password', () => {
    it('should contain a valid password', async () => {
      const passwordComparison = await user.comparePassword('badPassword')
      expect(passwordComparison).to.be.true
    })

    it('should not re-apply the hash to the password', async () => {
      const rawPass = userData.password
      userData.password = user.password
      await User.updateOne({ _id: new ObjectId(String(user._id)) }, userData)
      const updatedUser = await User.findOne({ _id: new ObjectId(String(user._id)) })

      const passwordComparison = await updatedUser!.comparePassword(rawPass)
      expect(passwordComparison).to.be.true
    })
  })

  describe('transform', () => {
    it('should transform the _id', () => {
      const userUpdated = user.transform()

      expect(user).to.not.equal(userUpdated)
      expect(userUpdated).to.have.property('id')
      expect(userUpdated).to.not.have.property('_id')
    })
  })
})
