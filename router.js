'use strict'
const express = require('express')
const router = express.Router()

const userController = require('./controllers/user')
const goalController = require('./controllers/goal')
const statisticController = require('./controllers/statistic')
const graphController = require('./controllers/graph')
const graphStatController = require('./controllers/graph-stat')
const auth = require('./middlewares/auth')

router.get('/test', (req, res) => {
  res.status(200).send({ message: 'Goals RESTful api' })
})

router.get('/users', auth, userController.findAll)
router.get('/users/:id', auth, userController.findById)
router.put('/users/:id', auth, userController.update)
router.post('/signup', auth, userController.signUp)
router.post('/signin', auth, userController.signIn)
router.delete('/users/:id', auth, userController.deleteOne)
router.post('/users/refresh-token', auth, userController.refreshToken)
router.delete('/users/refresh-token/:id', auth, userController.deleteRefreshToken)
router.patch('/users/:id/change-password/', auth, userController.changePassword)

router.post('/goals', auth, goalController.add)
router.get('/goals', auth, goalController.findByUser)
router.get('/goals/:id', auth, goalController.findById)
router.put('/goals/:id', auth, goalController.update)
router.delete('/goals/:id', auth, goalController.deleteOne)

router.post('/graphs', auth, graphController.add)
router.get('/graphs', auth, graphController.findByUser)
router.get('/graphs/:id', auth, graphController.findById)
router.put('/graphs/:id', auth, graphController.update)
router.delete('/graphs/:id', auth, graphController.deleteOne)

router.post('/statistics', auth, statisticController.add)
router.get('/statistics', auth, statisticController.findByUser)
router.get('/statistics/:id', auth, statisticController.findById)
router.put('/statistics/:id', auth, statisticController.update)
router.delete('/statistics/:id', auth, statisticController.deleteOne)

router.get('/graphs-stats', auth, graphStatController.findByUser)

module.exports = router
