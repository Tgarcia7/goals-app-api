'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const router = require('./routes')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded( { extended: false } ))
app.use(bodyParser.json())

app.use('/', router)

// Handle 404
app.use((req, res) => {
  res.status(404).send({ message: 'Not found' })
})

module.exports = app
