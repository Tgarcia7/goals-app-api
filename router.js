'use strict'
const express = require('express')
const router = express.Router()

const userController = require('./controllers/user')
const goalController = require('./controllers/goal')
const statisticController = require('./controllers/statistic')
const graphController = require('./controllers/graph')
const auth = require('./middlewares/auth')

router.get('/users', auth, userController.findAll)
router.get('/users/:id', auth, userController.findById)
router.put('/users/:id', auth, userController.update)
router.post('/signup', auth, userController.signUp)
router.post('/signin', auth, userController.signIn)
router.delete('/users/:id', auth, userController.deleteOne)

router.post('/goals', auth, goalController.add)
router.get('/goals', auth, goalController.findAll)
router.get('/goals/:id', auth, goalController.findById)
router.put('/goals/:id', auth, goalController.update)
router.delete('/goals/:id', auth, goalController.deleteOne)

router.post('/graphs', auth, graphController.add)
router.get('/graphs', auth, graphController.findAll)
router.get('/graphs/:id', auth, graphController.findById)
router.put('/graphs/:id', auth, graphController.update)
router.delete('/graphs/:id', auth, graphController.deleteOne)

router.post('/statistics', auth, statisticController.add)
router.get('/statistics', auth, statisticController.findAll)
router.get('/statistics/:id', auth, statisticController.findById)
router.put('/statistics/:id', auth, statisticController.update)
router.delete('/statistics/:id', auth, statisticController.deleteOne)

module.exports = router