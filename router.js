'use strict'
const express = require('express')
const router = express.Router()

const userController = require('./controllers/user')
const goalController = require('./controllers/goal')
const statisticController = require('./controllers/statistic')
const graphController = require('./controllers/graph')
const auth = require('./middlewares/auth')

router.get('/users', userController.findAll)
router.get('/users/:id', userController.findById)
router.put('/users/:id', userController.update)
router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)
router.delete('/users/:id', userController.deleteOne)
router.delete('/users/', userController.deleteAll)

router.post('/goals', goalController.add)
router.get('/goals', auth, goalController.findAll)
router.get('/goals/:id', goalController.findById)
router.put('/goals/:id', goalController.update)
router.delete('/goals/:id', goalController.deleteOne)
router.delete('/goals/', goalController.deleteAll)

router.post('/statistics', statisticController.add)

router.post('/graphs', graphController.add)

module.exports = router