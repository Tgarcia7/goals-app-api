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

module.exports = app
