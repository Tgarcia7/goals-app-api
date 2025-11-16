import sinon from 'sinon'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer | null = null

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

async function initDb(): Promise<MongoMemoryServer> {
  // Let mongodb-memory-server auto-detect best available version
  // In CI/CD, tests should be run via Docker which provides MongoDB container
  const mongoServer = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger'
    }
  })
  const url = mongoServer.getUri()

  await mongoose.connect(url)

  return mongoServer
}

async function closeDb(mongoServer: MongoMemoryServer | null): Promise<void> {
  if (!mongoServer) return

  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

async function cleanDb(mongoServer: MongoMemoryServer | null): Promise<void> {
  if (!mongoServer) return

  const collections = mongoose.connection.collections
  const removePromises: Promise<unknown>[] = []

  for (const key in collections) {
    const collection = collections[key]
    removePromises.push(collection.deleteMany({}))
  }

  await Promise.all(removePromises)
}

function restoreSinonObjects(): void {
  sinon.restore()
}
