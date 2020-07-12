'use strict'
const express = require('express')
const userController = require('./controllers/user')
//const auth = require('./middlewares/auth')
const router = express.Router()

router.get('/users', userController.findAll)
router.get('/users/:id', userController.findById)
router.post('/users/:id', userController.update)
router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)
router.delete('/users/:id', userController.deleteOne)
router.delete('/users/', userController.deleteAll)

//router.get('/users', auth, userController.getAll)

module.exports = router