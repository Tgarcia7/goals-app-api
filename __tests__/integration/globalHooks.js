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
  // a clean up is enough instead of a full db drop to avoid messing up the indexes
  await cleanDb()
  await mongoose.connection.close()
}

async function cleanDb() {
  const collections = await mongoose.connection.db.collections()
  const removePromises = []

  for (const collection of collections) {
    removePromises.push(collection.deleteMany())
  }

  await Promise.all(removePromises)
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
