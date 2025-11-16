import fs from 'fs'
import * as UserController from '../../../src/controllers/user'
import UserModel from '../../../src/models/user'
import sinon from 'sinon'
import * as testUtils from '../tests-utils'
import { Response } from 'express'
import { AuthenticatedRequest } from '../../../src/types'

describe('findAll', () => {
  let req: ReturnType<typeof testUtils.mockRequest>
  let res: ReturnType<typeof testUtils.mockResponse>
  let userData: unknown[]
  let userStub: sinon.SinonStub

  before(() => {
    const jsonFile = './__tests__/unit/data/user-data.json'
    userData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))
  })

  beforeEach(async () => {
    userStub = sinon.stub(UserModel, 'find')
    req = testUtils.mockRequest()
    res = testUtils.mockResponse()
  })

  it('should send the users successfully', async () => {
    userStub.withArgs(sinon.match.object, sinon.match.object).returns(userData)

    await UserController.findAll(req as unknown as AuthenticatedRequest, res as unknown as Response)

    sinon.assert.calledOnceWithMatch(res.status, 200)
    sinon.assert.calledOnceWithMatch(res.send, userData)
  })

  it('should fail due to a model layer error', async () => {
    const error = new Error('MongoDB error obtaining data')
    userStub.throws(error)

    await UserController.findAll(req as unknown as AuthenticatedRequest, res as unknown as Response)

    sinon.assert.calledOnceWithMatch(res.status, 500)
    sinon.assert.calledOnceWithMatch(res.send, { message: 'Server error' })
  })
})
