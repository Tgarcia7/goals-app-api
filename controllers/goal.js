'use strict'
const Goal = require('../models/goal')
const { ObjectId } = require('mongodb')

// Whitelist of allowed fields for query filtering
const ALLOWED_FILTER_FIELDS = ['status', 'type', 'title', 'date', 'progress']
const ALLOWED_SORT_FIELDS = ['date', 'dateCreated', 'title', 'status', 'progress']

function sanitizeFilter(query) {
  const sanitized = {}
  for (const key of ALLOWED_FILTER_FIELDS) {
    if (query[key] !== undefined) {
      sanitized[key] = query[key]
    }
  }
  return sanitized
}

function sanitizeSort(sort) {
  const sanitized = {}
  for (const key in sort) {
    if (ALLOWED_SORT_FIELDS.includes(key)) {
      sanitized[key] = sort[key] === -1 ? -1 : 1
    }
  }
  return Object.keys(sanitized).length ? sanitized : { date: 1, dateCreated: 1 }
}

async function add (req, res) {
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
      userId: new ObjectId(req.user.userId) // Use authenticated user, not body
    })

    const newGoal = await goal.save()

    res.status(201).send({ message: 'Goal added', goal: newGoal })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser (req, res) {
  try {
    const page = Number(req.body.page) || 0
    const results = Number(req.body.results) || 0

    let sort = { date: 1, dateCreated: 1 }
    if (req.body.sort) {
      try {
        sort = sanitizeSort(JSON.parse(req.body.sort))
      } catch (e) {
        return res.status(400).send({ message: 'Invalid sort parameter' })
      }
    }

    let filter = {}
    if (req.body.query) {
      try {
        filter = sanitizeFilter(JSON.parse(req.body.query))
      } catch (e) {
        return res.status(400).send({ message: 'Invalid query parameter' })
      }
    }

    filter.userId = new ObjectId(req.user.userId)

    const goals = await Goal.find(filter).skip(page).limit(results).sort(sort)

    if (!goals.length) return res.status(404).send({ message: 'Not found' })

    const goalsTransformed = goals.map(goal => goal.transform())

    res.status(200).send(goalsTransformed)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findById (req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid ID format' })
    }

    const filter = {
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId) // IDOR protection
    }
    const goal = await Goal.findOne(filter)

    if (!goal) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(goal.transform())
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function update (req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid ID format' })
    }

    // IDOR protection: only update if owned by user
    const filter = {
      '_id': new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    }
    const result = await Goal.updateOne(filter, req.body)

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Update completed', updatedRows: result.modifiedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function deleteOne (req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid ID format' })
    }

    // IDOR protection: only delete if owned by user
    const filter = {
      '_id': new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    }
    const result = await Goal.deleteOne(filter)

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne
}
