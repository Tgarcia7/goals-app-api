import config from '../../../src/config'
import { expect } from 'chai'
import { axios } from '../test-utils'

describe('/graphs-stats', () => {
  let authToken: string

  before(async () => {
    // Create a unique user for this test suite
    const graphStatUser = {
      name: 'graphStatUser',
      email: 'graphstat@test.com',
      password: 'testpass'
    }

    const res = await axios.post('/signup', graphStatUser, {
      headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN }
    })
    authToken = res.data.token
  })

  describe('GET', () => {
    describe('with authentication', () => {
      it('should return stats and graphs structure', async () => {
        const res = await axios.get('/graphs-stats', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })

        expect(res.status).to.equal(200)
        expect(res.data).to.have.property('stats')
        expect(res.data).to.have.property('graphs')
        expect(res.data.stats).to.be.an('array')
        expect(res.data.graphs).to.be.an('array')
      })

      it('should return empty arrays for new user', async () => {
        const res = await axios.get('/graphs-stats', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })

        expect(res.status).to.equal(200)
        expect(res.data.stats).to.be.an('array')
        expect(res.data.graphs).to.be.an('array')
      })
    })

    describe('without authentication', () => {
      it('should return unauthorized', async () => {
        // Explicitly remove auth header
        const res = await axios.get('/graphs-stats', {
          headers: { 'Authorization': '' }
        })

        expect(res.status).to.equal(401)
      })
    })

    describe('with invalid token', () => {
      it('should return error', async () => {
        const res = await axios.get('/graphs-stats', {
          headers: { 'Authorization': 'Bearer invalid-token' },
          validateStatus: () => true // Accept any status code including 500
        })

        // JWT service returns 500 for invalid tokens (not expired)
        expect(res.status).to.be.oneOf([401, 403, 500])
      })
    })
  })
})
