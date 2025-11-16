import { Response } from 'express'
import Statistic from '../models/statistic'
import { ObjectId } from 'mongodb'
import { AuthenticatedRequest } from '../types'
import { Types } from 'mongoose'

async function add(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const statistic = new Statistic({
      name: req.body.name,
      total: req.body.total,
      sign: req.body.sign,
      icon: req.body.icon,
      color: req.body.color,
      description: req.body.description,
      userId: new Types.ObjectId(req.user!.userId) // Use authenticated user
    })

    const newStatistic = await statistic.save()

    res.status(201).send({ message: 'Statistic added', statistic: newStatistic })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filter = { userId: new Types.ObjectId(req.user!.userId) }
    const statistics = await Statistic.find(filter)

    if (!statistics.length) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(statistics)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    const filter = {
      _id: new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId) // IDOR protection
    }
    const statistic = await Statistic.findOne(filter)

    if (!statistic) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(statistic)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    // IDOR protection: only update if owned by user
    const filter = {
      '_id': new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId)
    }
    const result = await Statistic.updateOne(filter, req.body)

    if (result.matchedCount === 0) {
      res.status(404).send({ message: 'Not found or unauthorized' })
      return
    }

    res.status(200).send({ message: 'Update completed', updatedRows: result.modifiedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function deleteOne(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    // IDOR protection: only delete if owned by user
    const filter = {
      '_id': new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId)
    }
    const result = await Statistic.deleteOne(filter)

    if (result.deletedCount === 0) {
      res.status(404).send({ message: 'Not found or unauthorized' })
      return
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function initialStats(userId: Types.ObjectId): Promise<void> {
  const stat1 = new Statistic({
    name: 'completedOnTime',
    total: 0,
    sign: '%',
    icon: ['fas', 'trophy'],
    color: '#b39700',
    description: 'completadas a tiempo',
    userId
  })

  const stat2 = new Statistic({
    name: 'completedYear',
    total: 0,
    sign: '',
    icon: ['fas', 'check'],
    color: '#06a106',
    description: 'completadas este año',
    userId
  })

  const statsPromises = [
    stat1.save(),
    stat2.save()
  ]

  await Promise.all(statsPromises)
}

export {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialStats
}
