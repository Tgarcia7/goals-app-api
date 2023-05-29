'use strict'

const config = require('../../config')
const expect = require('chai').expect
const axios = require('axios')

describe('Sign Up', function(){
  it('Should return successful response', async () => {
    const payload = {
      name: 'userName',
      email: 'user@test.com',
      password: 'abcd',
      admin: 1,
    }

    const res = await axios.post('http://api:3000/signup',
      payload,
      { headers: {'Authorization': 'Bearer ' + config.TEST_TOKEN} }
    )

    expect(res.status).to.equal(201)
  })
})
