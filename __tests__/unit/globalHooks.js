'use strict'

const sinon = require('sinon')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongo

before(async () => {
  mongo = await initDb()
})

after(async () => {
  await closeDb(mongo)
})

afterEach(async () => {
  restoreSinonObjects()
  await cleanDb(mongo, mongoose.connection.db)
})

async function initDb() {
  const mongo = await MongoMemoryServer.create()
  const url = mongo.getUri()

  await mongoose.connect(url, {
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useNewUrlParser: true
  })

  return mongo
}

async function closeDb(mongo) {
  if (!mongo) return

  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongo.stop()
}

async function cleanDb(mongo, db) {
  if (!mongo) return

  const collections = await db.listCollections().toArray()
  const removePromises = []

  collections
    .map((collection) => collection.name)
    .forEach(async (collectionName) => {
      // skip built in collections or indexes
      if (collectionName.indexOf('schema_migrations') > -1 || collectionName.indexOf('indexes') > -1) return
      removePromises.push(db.dropCollection(collectionName))
    })

  await Promise.all(removePromises)
}

function restoreSinonObjects() {
  sinon.restore()
}

// Catch unhandled rejections in tests and hard fail
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection during unit tests', err)
  process.exit(1)
})
