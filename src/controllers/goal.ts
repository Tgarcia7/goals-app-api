import { Response } from 'express'
import Goal from '../models/goal'
import { ObjectId } from 'mongodb'
import { AuthenticatedRequest } from '../types'
import { Types } from 'mongoose'

// Whitelist of allowed fields for query filtering
const ALLOWED_FILTER_FIELDS = ['status', 'type', 'title', 'date', 'progress']
const ALLOWED_SORT_FIELDS = ['date', 'dateCreated', 'title', 'status', 'progress']

interface SortObject {
  [key: string]: 1 | -1
}

interface FilterObject {
  [key: string]: unknown
}

function sanitizeFilter(query: Record<string, unknown>): FilterObject {
  const sanitized: FilterObject = {}
  for (const key of ALLOWED_FILTER_FIELDS) {
    if (query[key] !== undefined) {
      sanitized[key] = query[key]
    }
  }
  return sanitized
}

function sanitizeSort(sort: Record<string, unknown>): SortObject {
  const sanitized: SortObject = {}
  for (const key in sort) {
    if (ALLOWED_SORT_FIELDS.includes(key)) {
      sanitized[key] = sort[key] === -1 ? -1 : 1
    }
  }
  return Object.keys(sanitized).length ? sanitized : { date: 1, dateCreated: 1 }
}

async function add(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const goal = new Goal({
      title: req.body.title,
      icon: req.body.icon,
      type: req.body.type,
      date: req.body.date,
      objectiveTotal: req.body.objectiveTotal,
      objectiveDone: req.body.objectiveDone,
      status: req.body.status,
      progress: req.body.progress,
      stepsList: req.body.stepsList,
      dateCompleted: req.body.dateCompleted,
      dateCreated: req.body.dateCreated,
      userId: new Types.ObjectId(req.user!.userId) // Use authenticated user, not body
    })

    const newGoal = await goal.save()

    res.status(201).send({ message: 'Goal added', goal: newGoal })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.body.page) || 0
    const results = Number(req.body.results) || 0

    let sort: SortObject = { date: 1, dateCreated: 1 }
    if (req.body.sort) {
      try {
        sort = sanitizeSort(JSON.parse(req.body.sort))
      } catch (e) {
        res.status(400).send({ message: 'Invalid sort parameter' })
        return
      }
    }

    let filter: FilterObject = {}
    if (req.body.query) {
      try {
        filter = sanitizeFilter(JSON.parse(req.body.query))
      } catch (e) {
        res.status(400).send({ message: 'Invalid query parameter' })
        return
      }
    }

    filter.userId = new Types.ObjectId(req.user!.userId)

    const goals = await Goal.find(filter).skip(page).limit(results).sort(sort)

    if (!goals.length) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    const goalsTransformed = goals.map(goal => goal.transform())

    res.status(200).send(goalsTransformed)
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
    const goal = await Goal.findOne(filter)

    if (!goal) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(goal.transform())
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
    const result = await Goal.updateOne(filter, req.body)

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
    const result = await Goal.deleteOne(filter)

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

export {
  add,
  findByUser,
  findById,
  update,
  deleteOne
}
