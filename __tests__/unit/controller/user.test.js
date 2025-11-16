'use strict'

const fs = require('fs')
const UserController = require('../../../controllers/user')
const UserModel = require('../../../models/user')
const sinon = require('sinon')
const testUtils = require('../tests-utils')

describe('findAll', () => {
  let req
  let res
  let userData
  let userStub

  before(() => {
    const jsonFile = './__tests__/unit/data/user-data.json'
    userData = JSON.parse(fs.readFileSync(jsonFile))
  })

  beforeEach(async () => {
    userStub = sinon.stub(UserModel, 'find')
    req = testUtils.mockRequest()
    res = testUtils.mockResponse()
  })

  it('should send the users successfully', async () => {
    userStub.withArgs(sinon.match.object, sinon.match.object).returns(userData)

    await UserController.findAll(req, res)

    sinon.assert.calledOnceWithMatch(res.status, 200)
    sinon.assert.calledOnceWithMatch(res.send, userData)
  })

  it('should fail due to a model layer error', async () => {
    const error = new Error('MongoDB error obtaining data')
    userStub.throws(error)

    await UserController.findAll(req, res)

    sinon.assert.calledOnceWithMatch(res.status, 500)
    sinon.assert.calledOnceWithMatch(res.send, { message: 'Server error' })
  })
})
