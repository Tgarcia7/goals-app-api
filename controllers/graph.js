'use strict'
const Graph = require('../models/graph')
const ObjectId = require('mongodb').ObjectID
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
      userId: ObjectId(req.body.userId)
    })

    const newGraph = await graph.save()

    res.status(201).send({ message: 'Graph added', graph: newGraph })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Server error', error })
  }
}

async function findByUser (req, res) {
  try {
    const filter = { userId: ObjectId(req.user) }
    const graph = await Graph.find(filter)

    if (!Object.keys(graph).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graph)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    const filter = { status: 1, _id: ObjectId(req.params.id) }
    const graph = await Graph.find(filter)

    if (!Object.keys(graph).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(graph)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function update (req, res) {
  try {
    if (req.body.data) req.body.data = JSON.parse(req.body.data)
      
    const filter = { '_id': ObjectId(req.params.id) }
    const updateResult = await Graph.updateOne(filter, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.nModified })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteOne (req, res) {
  try {
    const filter = { '_id': ObjectId(req.params.id) }
    const deleteResult = await Graph.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

function initialGraphs (userId) {
  return new Promise(async (resolve, reject) => {
    try {
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
      
      let graphsPromises = [
        graph1.save(),
        graph2.save(),
        graph3.save()
      ]
  
      await Promise.all(graphsPromises)
  
      resolve() 
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialGraphs
}