import express, { Request, Response, RequestHandler } from 'express'
import * as userController from '../controllers/user'
import * as goalController from '../controllers/goal'
import * as statisticController from '../controllers/statistic'
import * as graphController from '../controllers/graph'
import * as graphStatController from '../controllers/graph-stat'
import auth from '../middlewares/auth'

const router = express.Router()

router.get('/test', (_req: Request, res: Response) => {
  res.status(200).send({ message: 'Goals RESTful api' })
})

router.get('/users', auth as RequestHandler, userController.findAll as RequestHandler)
router.get('/users/:id', auth as RequestHandler, userController.findById as RequestHandler)
router.put('/users/:id', auth as RequestHandler, userController.update as RequestHandler)
router.post('/signup', userController.signUp as RequestHandler)
router.post('/signin', userController.signIn as RequestHandler)
router.delete('/users/:id', auth as RequestHandler, userController.deleteOne as RequestHandler)
router.post('/users/refresh-token', auth as RequestHandler, userController.refreshToken as RequestHandler)
router.delete('/users/refresh-token/:id', auth as RequestHandler, userController.deleteRefreshToken as RequestHandler)
router.patch('/users/:id/change-password/', auth as RequestHandler, userController.changePassword as RequestHandler)

router.post('/goals', auth as RequestHandler, goalController.add as RequestHandler)
router.get('/goals', auth as RequestHandler, goalController.findByUser as RequestHandler)
router.get('/goals/:id', auth as RequestHandler, goalController.findById as RequestHandler)
router.put('/goals/:id', auth as RequestHandler, goalController.update as RequestHandler)
router.delete('/goals/:id', auth as RequestHandler, goalController.deleteOne as RequestHandler)

router.post('/graphs', auth as RequestHandler, graphController.add as RequestHandler)
router.get('/graphs', auth as RequestHandler, graphController.findByUser as RequestHandler)
router.get('/graphs/:id', auth as RequestHandler, graphController.findById as RequestHandler)
router.put('/graphs/:id', auth as RequestHandler, graphController.update as RequestHandler)
router.delete('/graphs/:id', auth as RequestHandler, graphController.deleteOne as RequestHandler)

router.post('/statistics', auth as RequestHandler, statisticController.add as RequestHandler)
router.get('/statistics', auth as RequestHandler, statisticController.findByUser as RequestHandler)
router.get('/statistics/:id', auth as RequestHandler, statisticController.findById as RequestHandler)
router.put('/statistics/:id', auth as RequestHandler, statisticController.update as RequestHandler)
router.delete('/statistics/:id', auth as RequestHandler, statisticController.deleteOne as RequestHandler)

router.get('/graphs-stats', auth as RequestHandler, graphStatController.findByUser as RequestHandler)

// Handle 404
router.use((_req: Request, res: Response) => {
  res.status(404).send({ message: 'Not found' })
})

export default router
