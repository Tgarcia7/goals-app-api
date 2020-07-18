'use strict'
const Graph = require('../models/graph')
const { pushGraph, pullGraph } = require('./user')
const ObjectId = require('mongodb').ObjectID
const utils = require('../utils/index')

async function add (req, res) {
  if (req.body.chartdata && !utils.JSONStringValidate(req.body.chartdata)) 
    return res.status(400).send({ message: 'Bad request' })
    
  try {

    const graph = new Graph({
      title: req.body.title,
      type: req.body.type,
      year: req.body.year,
      chartdata: JSON.parse(req.body.chartdata),
      userId: ObjectId(req.body.userId)
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

    await pullGraph(req.params.id) 
    let result = await Graph.deleteOne(filter)

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
  deleteOne
}