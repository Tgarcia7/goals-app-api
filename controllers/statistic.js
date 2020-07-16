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

async function findAll (req, res) {
  try {
    let filter = { userId: ObjectId(req.user) }

    let statistic = await Statistic.find(filter)
    if (!Object.keys(statistic).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(statistic)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    if (req.params && !req.params.id) return res.status(400).send({ message: 'Missing params' })

    let filter = { status: 1, '_id': ObjectId(req.params.id) }

    let statistic = await Statistic.find(filter)
    if (!Object.keys(statistic).length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(statistic)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function update (req, res) {
  try {
    if ( (req.body && !Object.keys(req.body).length) || 
      (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }
    let result = await Statistic.updateOne(filter, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteOne (req, res) {
  try {
    if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }
    let result = await Statistic.deleteOne(filter)
    
    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteAll (req, res) {
  try {
    let result = await Statistic.deleteMany({})

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