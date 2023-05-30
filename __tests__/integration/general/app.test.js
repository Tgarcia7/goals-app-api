'use strict'

const expect = require('chai').expect
const { axios } = require('../test-utils')

describe('GET /test', function(){
  it('Should return successful response', async () => {
    const res = await axios.get('/test')

    expect(res.status).to.equal(200)
    expect(res.data).to.have.property('message')
    expect(res.data.message).to.equal('Goals RESTful api')
  })
})

describe('ANY /not-found', function(){
  it('Should return not found', async () => {
    const res = await axios.get('/non-existing')

    expect(res.status).to.equal(404)
    expect(res.data).to.have.property('message')
    expect(res.data.message).to.equal('Not found')
  })
})
