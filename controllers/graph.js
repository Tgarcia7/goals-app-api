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

async function findAll (req, res) {
  try {
    let filter = { userId: ObjectId(req.user) }

    let graph = await Graph.find(filter)
    if (!Object.keys(graph).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graph)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    if (req.params && !req.params.id) return res.status(400).send({ message: 'Missing params' })

    let filter = { status: 1, '_id': ObjectId(req.params.id) }

    let graph = await Graph.find(filter)
    if (!Object.keys(graph).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graph)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function update (req, res) {
  try {
    if ( (req.body && !Object.keys(req.body).length) || 
      (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

    if (req.body.chartdata) req.body.chartdata = JSON.parse(req.body.chartdata)
      
    let filter = { '_id': ObjectId(req.params.id) }
    let result = await Graph.updateOne(filter, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteOne (req, res) {
  try {
    if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }

    let result = await Graph.deleteOne(filter)
    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteAll (req, res) {
  try {
    let result = await Graph.deleteMany({})

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  add,
  findAll,
  findById,
  update,
  deleteOne,
  deleteAll
}