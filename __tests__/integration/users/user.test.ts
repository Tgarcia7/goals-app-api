import config from '../../../src/config'
import { expect } from 'chai'
import { axios, testUser } from '../test-utils'

describe('/signup', () => {
  describe('POST', () => {
    describe('with valid data', () => {
      it('should return successful response', async () => {
        const payload = {
          name: 'userName',
          email: 'user@test.com',
          password: 'abcd',
          admin: 1,
        }

        const res = await axios.post('/signup', payload, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

        expect(res.status).to.equal(201)
        expect(res.data).to.have.property('token')
        expect(res.data.token).to.not.be.empty
      })
    })

    describe('with duplicated email', () => {
      it('should return conflict response', async () => {
        const res = await axios.post('/signup', testUser, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

        expect(res.status).to.equal(409)
        expect(res.data).to.have.property('message')
        expect(res.data.message).to.equal('Email duplicated')
      })
    })
  })
})

describe('/signIn', () => {
  describe('POST', () => {
    describe('with valid data', () => {
      it('should return successful response', async () => {
        const payload = {
          email: testUser.email,
          password: testUser.password
        }

        const res = await axios.post('/signin', payload)

        expect(res.status).to.equal(200)
        expect(res.data).to.have.property('message')
        expect(res.data.message).to.equal('Authenticated')
        expect(res.data).to.have.property('token')
        expect(res.data).to.have.property('refreshToken')
      })
    })

    describe('with invalid data', () => {
      it('with missing params, then should return bad request', async () => {
        const res = await axios.post('/signin', {})

        expect(res.status).to.equal(400)
        expect(res.data).to.have.property('message')
        expect(res.data.message).to.equal('Missing params')
      })

      it('with non-existent email, then should be unauthorized', async () => {
        const payload = {
          email: 'nonexistent@test.com',
          password: testUser.password
        }

        const res = await axios.post('/signin', payload)

        expect(res.status).to.equal(401)
        expect(res.data).to.have.property('message')
        expect(res.data.message).to.equal('Unauthorized')
      })

      it('with wrong password, then should be unauthorized', async () => {
        const payload = {
          email: testUser.email,
          password: 'badPassword'
        }

        const res = await axios.post('/signin', payload)

        expect(res.status).to.equal(401)
        expect(res.data).to.have.property('message')
        expect(res.data.message).to.equal('Unauthorized')
      })
    })
  })
})

describe('/users/', () => {
  describe('GET', () => {
    describe('with valid data', () => {
      before(async () => {
        const payload = {
          name: 'userName',
          email: 'user@test.com',
          password: 'abcd',
          admin: 1,
        }

        await axios.post('/signup', payload, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })
      })

      it('should return successful response', async () => {
        const res = await axios.get('/users', { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

        expect(res.status).to.equal(200)
        expect(res.data).to.not.be.empty
        expect(res.data[0]).to.not.have.property('password')
        expect(res.data[0]).to.not.have.property('__v')
        expect(res.data[0]).to.not.have.property('signupDate')
      })
    })
  })
})
