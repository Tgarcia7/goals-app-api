const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(config.db_uri, { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true })
  
mongoose.connection.on('error',function (err) { 
  console.error(`DB connection error: ${err}`)
  process.exit(0)
}) 

// If Node process ends
process.on('SIGINT', () => {   
  mongoose.connection.close( () => {
    process.exit(0)
  })
})