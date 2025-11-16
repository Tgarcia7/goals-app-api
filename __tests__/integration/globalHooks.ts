import mongoose from 'mongoose'
import { axios, getTestToken } from './test-utils'

before(async () => {
  // start DB only if tests are started, omitted when no tests are run
  await import('../../src/models/db')
  // makes sure db is clean before running
  await cleanDb()
  await generateAPIToken()
})

after(async () => {
  await closeDb()
})

async function closeDb(): Promise<void> {
  // a clean up is enough instead of a full db drop to avoid messing up the indexes
  await cleanDb()
  await mongoose.connection.close()
}

async function cleanDb(): Promise<void> {
  const db = mongoose.connection.db
  if (!db) return

  const collections = await db.collections()
  const removePromises: Promise<unknown>[] = []

  for (const collection of collections) {
    removePromises.push(collection.deleteMany({}))
  }

  await Promise.all(removePromises)
}

async function generateAPIToken(): Promise<void> {
  const token = await getTestToken()
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
