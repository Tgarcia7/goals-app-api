'use strict'
const Statistic = require('../models/statistic')
const ObjectId = require('mongodb').ObjectID

async function add (req, res) {
  try {
    const statistic = new Statistic({
      name: req.body.name,
      total: req.body.total,
      sign: req.body.sign,
      icon: req.body.icon,
      color: req.body.color,
      description: req.body.description,
      userId: req.body.userId
    })

    let newStatistic = await statistic.save()

    res.status(201).send({ message: 'Statistic added', statistic: newStatistic })
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error })
  }
}

async function findByUser (req, res) {
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

function initialStats (userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const stat1 = new Statistic({
        name: 'completedOnTime',
        total: 0,
        sign: '%',
        icon: [ 'fas', 'trophy'],
        color: '#b39700',
        description: 'completadas a tiempo',
        userId
      })
  
      const stat2 = new Statistic({
        name: 'completedYear',
        total: 0,
        sign: '',
        icon: [ 'fas', 'check' ],
        color: '#06a106',
        description: 'completadas este año',
        userId
      })
  
      let statsPromises = [
        stat1.save(),
        stat2.save()
      ]
  
      await Promise.all(statsPromises)
      
      resolve()
    } catch (error) {
      console.error(error)
      reject()
    }
  })
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialStats
}