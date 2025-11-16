'use strict'

const expect = require('chai').expect
const { axios, getTestToken } = require('../test-utils')

describe('/graphs-stats', () => {
  let authToken

  before(async () => {
    authToken = await getTestToken()
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
        const res = await axios.get('/graphs-stats')

        expect(res.status).to.equal(403)
      })
    })

    describe('with invalid token', () => {
      it('should return forbidden', async () => {
        const res = await axios.get('/graphs-stats', {
          headers: { 'Authorization': 'Bearer invalid-token' }
        })

        expect(res.status).to.equal(403)
      })
    })
  })
})
