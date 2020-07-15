'use strict'
const Statistic = require('../models/statistic')
const { pushStatistic } = require('./user')
const ObjectId = require('mongodb').ObjectID

async function add (req, res) {
  try {
    const statistic = new Statistic({
      name: 'completedOnTime',
      total: '90',
      sign: '%',
      icon: [ 'fas', 'trophy'] ,
      color: '#b39700',
      description: 'completadas a tiempo',
      userId: ObjectId('5f0bdd4f9b8245ff79e30067')
    })

    let newStatistic = await statistic.save()
    await pushStatistic(statistic.userId, newStatistic._id) 
    res.status(201).send({ message: 'Statistic added', statistic: newStatistic })
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  add
}