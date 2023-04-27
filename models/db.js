const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(
  config.DB_URI,
  { 
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    dbName: config.DB_NAME 
  }
)
  
mongoose.connection.on('error', err => { 
  console.error(`DB connection error: ${err}`)
  process.exit(0)
}) 

// If Node process ends
process.on('SIGINT', () => {   
  mongoose.connection.close( () => {
    process.exit(0)
  })
})
