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
  await cleanDb(mongo)
})

async function initDb() {
  // Let mongodb-memory-server auto-detect best available version
  // In CI/CD, tests should be run via Docker which provides MongoDB container
  const mongo = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger'
    }
  })
  const url = mongo.getUri()

  await mongoose.connect(url)

  return mongo
}

async function closeDb(mongo) {
  if (!mongo) return

  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongo.stop()
}

async function cleanDb(mongo) {
  if (!mongo) return

  const collections = mongoose.connection.collections
  const removePromises = []

  for (const key in collections) {
    const collection = collections[key]
    removePromises.push(collection.deleteMany())
  }

  await Promise.all(removePromises)
}

function restoreSinonObjects() {
  sinon.restore()
}
