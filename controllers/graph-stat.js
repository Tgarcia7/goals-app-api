'use strict'
const Graph = require('../models/graph')
const Statistic = require('../models/statistic')
const ObjectId = require('mongodb').ObjectID

async function findByUser (req, res) {
  try {
    const filter = { userId: ObjectId(req.user.userId) }
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

module.exports = {
  findByUser
}