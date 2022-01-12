'use strict'
const expect = require('chai').expect
const app = require('../app')
const supertest = require('supertest')

before(() => {
  process.env.NODE_ENV = 'test'
})

describe('Healthcheck', function(){
  it('Should return successful response', async () => {
    const res = await supertest(app).get('/test')
    expect(res.status).to.equal(200)
  })
})

describe('Not found', function(){
  it('Should return not found', async () => {
    const res = await supertest(app).get('/non-existing')
    expect(res.status).to.equal(404)
  })
})
