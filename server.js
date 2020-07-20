'use strict'
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = require('./router')
const config = require('./config')
require('./models/db')

app.use(bodyParser.urlencoded( { extended: false } ))
app.use(bodyParser.json())

app.use('/', router)
// Handle 404
app.use((req, res) => {
  res.status(404).send({ message: 'Not found' })
})

app.listen(config.PORT, () => {
  console.log(`Goals api listening on port ${config.PORT}`)
})
