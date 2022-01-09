'use strict'
const app = require('../app')
const supertest = require('supertest')

beforeAll(() => {
  process.env.NODE_ENV = 'test'
})

test('Test health check endpoint', async () => {
  const res = await supertest(app).get('/test')
  expect(res.status).toBe(200)
})

test('Test non-existing endpoint', async () => {
  const res = await supertest(app).get('/non-existing')
  expect(res.status).toBe(404)
})
