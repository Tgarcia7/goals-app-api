'use strict'

require('../../models/db')
const mongoose = require('mongoose')
const { axios, getTestToken } = require('./test-utils')

before(async () => {
  generateAPIToken()
})

after(async () => {
  await closeDb()
})

async function closeDb() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
}

async function generateAPIToken() {
  const token = await getTestToken()
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Catch unhandled rejections in tests and hard fail
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection during integration tests', err)
  process.exit(1)
})
