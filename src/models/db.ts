import mongoose from 'mongoose'
import config from '../config'

mongoose.connect(
  config.DB_URI,
  {
    dbName: config.DB_NAME
  }
)

mongoose.connection.on('error', (err: Error) => {
  console.error(`DB connection error: ${err}`)
  process.exit(0)
})

// If Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

export default mongoose.connection
