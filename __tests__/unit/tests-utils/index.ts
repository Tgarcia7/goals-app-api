import sinon from 'sinon'

interface MockRequest {
  get(name: string): string | null
  session: { data: unknown }
  body: unknown
  headers: { authorization?: string }
  params: Record<string, string>
  user: unknown
}

interface MockResponse {
  status: sinon.SinonStub
  json: sinon.SinonStub
  send: sinon.SinonStub
}

const mockRequest = (sessionData?: unknown, body?: unknown, authHeader?: string): MockRequest => ({
  get(name: string): string | null {
    if (name === 'authorization') return authHeader || null
    return null
  },
  session: { data: sessionData },
  body,
  headers: authHeader ? { authorization: authHeader } : {},
  params: {},
  user: {}
})

const mockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: sinon.stub(),
    json: sinon.stub(),
    send: sinon.stub()
  }
  res.status.returns(res)
  res.json.returns(res)
  res.send.returns(res)
  return res
}

export {
  mockRequest,
  mockResponse,
  MockRequest,
  MockResponse
}
