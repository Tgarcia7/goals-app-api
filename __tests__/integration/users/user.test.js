'use strict'

const config = require('../../../config')
const expect = require('chai').expect
const { axios, testUser } = require('../test-utils')

describe('POST /signup', () => {
  it('Should return successful response', async () => {
    const payload = {
      name: 'userName',
      email: 'user@test.com',
      password: 'abcd',
      admin: 1,
    }

    const res = await axios.post('/signup', payload, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

    expect(res.status).to.equal(201)
    expect(res.data).to.have.property('token')
    expect(res.data.token).to.not.be.undefined
  })

  it('Should fail, duplicated email', async () => {
    const payload = {
      name: 'userName',
      email: 'user@test.com',
      password: 'abcd',
      admin: 1,
    }

    const res = await axios.post('/signup', payload, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

    expect(res.status).to.equal(409)
    expect(res.data).to.have.property('message')
    expect(res.data.message).to.equal('Email duplicated')
  })
})

describe('POST /signIn', () => {
  it('Should return successful response', async () => {
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

  it('Should return bad request, missing params', async () => {
    const res = await axios.post('/signin', {})

    expect(res.status).to.equal(400)
    expect(res.data).to.have.property('message')
    expect(res.data.message).to.equal('Missing params')
  })

  it('Should be unauthorized, wrong token', async () => {
    const payload = {
      email: testUser.email,
      password: testUser.password
    }

    const res = await axios.post('/signin', payload, { headers: { 'Authorization': '' } })

    expect(res.status).to.equal(401)
    expect(res.data).to.have.property('message')
    expect(res.data.message).to.equal('Unauthorized')
  })

  it('Should be unauthorized, wrong password', async () => {
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

describe('GET /users/', () => {
  before(async () => {
    const payload = {
      name: 'userName',
      email: 'user@test.com',
      password: 'abcd',
      admin: 1,
    }

    await axios.post('/signup', payload, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })
  })

  it('Should return successful response', async () => {
    const res = await axios.get('/users', {}, { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } })

    expect(res.status).to.equal(200)
    expect(res.data).to.not.be.empty
    expect(res.data[0]).to.not.have.property('password')
    expect(res.data[0]).to.not.have.property('__v')
    expect(res.data[0]).to.not.have.property('signupDate')
  })
})
