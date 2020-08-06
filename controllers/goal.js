'use strict'
const Goal = require('../models/goal')
const ObjectId = require('mongodb').ObjectID

async function add (req, res) {
  try {
    const goal = new Goal({
      title: req.body.title,
      icon: JSON.parse(req.body.icon),
      type: req.body.type,
      userId: ObjectId(req.body.userId)
    })

    let newGoal = await goal.save()

    res.status(201).send({ message: 'Goal added', goal: newGoal })
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error })
  }
}

async function findByUser (req, res) {
  try {
    const page = Number(req.body.page) || 0 
    const results = Number(req.body.results) || 0
    const filter = req.body.query ? JSON.parse(req.body.query) : {}

    filter.userId = ObjectId(req.user.userId)

    let goals = await Goal.find(filter).skip(page).limit(results)
    if (!Object.keys(goals).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(goals)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    if (req.params && !req.params.id) return res.status(400).send({ message: 'Missing params' })

    let filter = { status: 1, '_id': ObjectId(req.params.id) }

    let goal = await Goal.find(filter)
    if (!Object.keys(goal).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(goal)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function update (req, res) {
  try {
    if ( (req.body && !Object.keys(req.body).length) || 
      (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }

    let result = await Goal.updateOne(filter, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteOne (req, res) {
  try {
    if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }

    let result = await Goal.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne
}