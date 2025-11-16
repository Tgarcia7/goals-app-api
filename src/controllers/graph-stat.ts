import { Response } from 'express'
import Graph from '../models/graph'
import Statistic from '../models/statistic'
import { AuthenticatedRequest } from '../types'
import { Types } from 'mongoose'

async function findByUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filter = { userId: new Types.ObjectId(req.user!.userId) }
    const graphsStatsPromises = [
      Graph.find(filter),
      Statistic.find(filter)
    ]

    const promisesResults = await Promise.all(graphsStatsPromises)
    const graphsStats = {
      graphs: promisesResults[0],
      stats: promisesResults[1]
    }

    res.status(200).send(graphsStats)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

export {
  findByUser
}
