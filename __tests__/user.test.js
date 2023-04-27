'use strict'
const config = require('../config')
const expect = require('chai').expect
const app = require('../app')
const supertest = require('supertest')

describe('Sign Up', function(){
  it('Should return successful response', async () => {
    const payload = {
      name: 'userName',
      email: 'user@test.com',
      password: 'abcd',
      admin: 1,
    }
    const res = 
        await supertest(app)
          .post('/signup')
          .set('Content-type', 'application/json')
          .set('Authorization', 'Bearer ' + config.TEST_TOKEN)
          .send(payload)

    expect(res.status).to.equal(201)
  })
})
