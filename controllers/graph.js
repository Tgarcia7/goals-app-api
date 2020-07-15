'use strict'
const Graph = require('../models/graph')
const { pushGraph } = require('./user')
const ObjectId = require('mongodb').ObjectID

async function add (req, res) {
  try {
    const graph = new Graph({
      title: 'Metas en proceso',
      type: 'Bar',
      year: null,
      chartdata: {
        labels: ['A tiempo', 'Vencidas'],
        datasets: [{
          data: [17,13,0],
          backgroundColor: ['rgba(6,160,6,0.2)', 'rgba(215,219,216,0.2)'],
          borderColor: ['rgba(6,160,6,1)', 'rgba(215,219,216,1)']
        }]
      },
      userId: ObjectId('5f0bdd4f9b8245ff79e30067')
    })

    let newGraph = await graph.save()
    await pushGraph(graph.userId, newGraph._id) 
    res.status(201).send({ message: 'Graph added', graph: newGraph })
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  add
}