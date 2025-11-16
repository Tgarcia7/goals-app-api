import { expect } from 'chai'
import supertest from 'supertest'
import app from '../../src/app'

describe('General endpoints', function () {
  describe('Health check', function () {
    it('should return successful response', async () => {
      const res = await supertest(app).get('/test')
      expect(res.status).to.equal(200)
      expect(res.text).to.equal('{"message":"Goals RESTful api"}')
    })
  })

  describe('Not found', function(){
    it('should return not found', async () => {
      const res = await supertest(app).get('/non-existing')
      expect(res.status).to.equal(404)
    })
  })
})
