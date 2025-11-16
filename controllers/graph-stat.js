'use strict'
const Graph = require('../models/graph')
const Statistic = require('../models/statistic')
const { ObjectId } = require('mongodb')

async function findByUser (req, res) {
  try {
    const filter = { userId: new ObjectId(req.user.userId) }
    const graphsStatsPromises = [
      Graph.find(filter),
      Statistic.find(filter)
    ]

    const promisesResults = await Promise.all(graphsStatsPromises)

    // Transform documents to match frontend expected schema
    const transformedGraphs = promisesResults[0].map(graph => graph.transform())
    const transformedStats = promisesResults[1].map(stat => stat.transform())

    const graphsStats = {
      graphs: transformedGraphs,
      stats: transformedStats
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
