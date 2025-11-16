'use strict'
const Graph = require('../models/graph')
const { ObjectId } = require('mongodb')
const utils = require('../utils/index')

async function add (req, res) {
  if ( !utils.JSONStringValidate(req.body.data) || !utils.JSONStringValidate(req.body.labels) )
    return res.status(400).send({ message: 'Bad request' })

  try {
    const graph = new Graph({
      title: req.body.title,
      type: req.body.type,
      byYear: req.body.byYear,
      labels: JSON.parse(req.body.labels),
      data: JSON.parse(req.body.data),
      userId: new ObjectId(req.user.userId) // Use authenticated user
    })

    const newGraph = await graph.save()

    res.status(201).send({ message: 'Graph added', graph: newGraph })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser (req, res) {
  try {
    const filter = { userId: new ObjectId(req.user.userId) }
    const graphs = await Graph.find(filter)

    if (!graphs.length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graphs)
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
    const graph = await Graph.findOne(filter)

    if (!graph) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graph)
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

    if (req.body.data) req.body.data = JSON.parse(req.body.data)

    // IDOR protection: only update if owned by user
    const filter = {
      '_id': new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    }
    const updateResult = await Graph.updateOne(filter, req.body)

    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.modifiedCount })
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
    const deleteResult = await Graph.deleteOne(filter)

    if (deleteResult.deletedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function initialGraphs (userId) {
  const graph1 = new Graph({
    title: 'Metas en proceso',
    type: 'Bar',
    byYear: false,
    labels: [ 'A tiempo', 'Vencidas' ],
    data: [0, 0, 0],
    userId
  })

  const graph2 = new Graph({
    title: 'Metas por tipo',
    type: 'Doughnut',
    byYear: false,
    data: [0, 0, 0],
    labels: [ 'Pasos', 'Simple', 'Objetivo' ],
    userId
  })

  const graph3 = new Graph({
    title: 'Metas completadas',
    type: 'Line',
    byYear: true,
    labels: [
      'Ene','Feb','Mar','Abr','May','Jun',
      'Jul','Ago','Sep','Oct','Nov','Dic'
    ],
    data: {},
    userId
  })

  const currentYear = `${new Date().getFullYear()}`
  graph3.data[currentYear] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  const graphsPromises = [
    graph1.save(),
    graph2.save(),
    graph3.save()
  ]

  await Promise.all(graphsPromises)
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialGraphs
}
