'use strict'
const express = require('express')
const userController = require('./controllers/user')
const goalController = require('./controllers/goal')
const auth = require('./middlewares/auth')
const router = express.Router()

router.get('/users', userController.findAll)
router.get('/users/:id', userController.findById)
router.post('/users/:id', userController.update)
router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)
router.delete('/users/:id', userController.deleteOne)
router.delete('/users/', userController.deleteAll)

router.post('/goals', goalController.add)
router.get('/goals', auth, goalController.findAll)
router.get('/goals/:id', goalController.findById)
router.post('/goals/:id', goalController.update)
router.delete('/goals/:id', goalController.deleteOne)
router.delete('/goals/', goalController.deleteAll)

module.exports = router