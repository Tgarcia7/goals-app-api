'use strict'

require('../../models/db')
const mongoose = require('mongoose')

afterEach(async () => {
  await cleanDb()
})

after(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

// Catch unhandled rejections in tests and hard fail
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('unhandled promise rejection', err)
  process.exit(1)
})

const cleanDb = async () => {
  const collections = mongoose.connection.collections
  const removePromises = []

  for (const key in collections) {
    if (key.indexOf('schema_migrations') > -1 || key.indexOf('indexes') > -1) return
    const collection = collections[key]
    removePromises.push(collection.deleteMany())
  }

  await Promise.all(removePromises)
}
