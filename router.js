'use strict'
const express = require('express')
const userController = require('./controllers/user')
//const auth = require('./middlewares/auth')
const router = express.Router()

router.get('/users', userController.getAll)
//router.get('/users', auth, userController.getAll)

module.exports = router