'use strict'

const mongoose = require('mongoose')
const { axios, getTestToken } = require('./test-utils')

before(async () => {
  // start DB only if tests are started, omitted when no tests are found
  require('../../models/db')
  // makes sure db is clean before running
  await cleanDb()
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
  const db = mongoose.connection.db
  if (!db) return 

  const collections = await db.collections()
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
