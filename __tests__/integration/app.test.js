'use strict'

const expect = require('chai').expect
const axios = require('axios')

describe('Healthcheck', function(){
  it('Should return successful response', async () => {
    const res = await axios.get('http://api:3000/test')
    expect(res.status).to.equal(200)
  })
})

describe('Not found', function(){
  it('Should return not found', async () => {
    try {
      await axios.get('http://api:3000/non-existing')
      assert.fail('The test should have thrown an error status')
    } catch (error) {
      expect(error.response.status).to.equal(404)
    }
  })
})
