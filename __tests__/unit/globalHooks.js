'use strict'

const sinon = require('sinon')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongo = undefined

before(async () => {
  mongo = await MongoMemoryServer.create()
  const url = mongo.getUri()

  await mongoose.connect(url, {
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useNewUrlParser: true
  })
})

after(async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongo.stop()
  }
})

afterEach(async () => {
  sinon.restore()

  if (mongo) {
    const collections = mongoose.connection.collections
    const removePromises = []

    for (const key in collections) {
      if (key.indexOf('schema_migrations') > -1 || key.indexOf('indexes') > -1) return
      const collection = collections[key]
      removePromises.push(collection.deleteMany())
    }

    await Promise.all(removePromises)
  }
})
