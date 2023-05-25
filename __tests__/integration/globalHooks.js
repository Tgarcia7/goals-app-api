'use strict'
require('../../models/db')
const mongoose = require('mongoose')

after(async () => {
  await cleanDb(mongoose.connection.db)
  mongoose.connection.close( () => process.exit(0) )
})

// Catch unhandled rejections in tests and hard fail
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('unhandled promise rejection', err)
  process.exit(1)
})

const cleanDb = async (db) => {
  const collections = await db.listCollections().toArray()

  const removePromises = []
  collections
    .map((collection) => collection.name)
    .forEach(async (collectionName) => {
      // skip built in collections or indexes
      if (collectionName.indexOf('schema_migrations') > -1 || collectionName.indexOf('indexes') > -1) {
        return
      }
      removePromises.push(db.dropCollection(collectionName))
    })

  await Promise.all(removePromises)
}
