'use strict'

const sinon = require('sinon')

const mockRequest = (sessionData, body, authHeader) => ({
  get(name) {
    if (name === 'authorization') return authHeader
    return null
  },
  session: { data: sessionData },
  body,
})

const mockResponse = () => {
  const res = {}
  res.status = sinon.stub().returns(res)
  res.json = sinon.stub().returns(res)
  res.send = sinon.stub().returns(res)
  return res
}

module.exports = {
  mockRequest,
  mockResponse
}
