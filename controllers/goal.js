'use strict'
const Goal = require('../models/goal')
const { pushGoal } = require('./user')
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
    await pushGoal(goal.userId, newGoal._id) 
    res.status(201).send({ message: 'Goal added', goal: newGoal })
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  add
}