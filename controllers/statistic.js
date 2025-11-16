'use strict'
const Statistic = require('../models/statistic')
const { ObjectId } = require('mongodb')

async function add (req, res) {
  try {
    const statistic = new Statistic({
      name: req.body.name,
      total: req.body.total,
      sign: req.body.sign,
      icon: req.body.icon,
      color: req.body.color,
      description: req.body.description,
      userId: new ObjectId(req.user.userId) // Use authenticated user
    })

    const newStatistic = await statistic.save()

    res.status(201).send({ message: 'Statistic added', statistic: newStatistic })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser (req, res) {
  try {
    const filter = { userId: new ObjectId(req.user.userId) }
    const statistics = await Statistic.find(filter)

    if (!statistics.length) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(statistics)
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
    const statistic = await Statistic.findOne(filter)

    if (!statistic) return res.status(404).send({ message: 'Not found' })

    res.status(200).send(statistic)
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

    // IDOR protection: only update if owned by user
    const filter = {
      '_id': new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    }
    const result = await Statistic.updateOne(filter, req.body)

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Update completed', updatedRows: result.modifiedCount })
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
    const result = await Statistic.deleteOne(filter)

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Not found or unauthorized' })
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function initialStats (userId) {
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

  const statsPromises = [
    stat1.save(),
    stat2.save()
  ]

  await Promise.all(statsPromises)
}

module.exports = {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialStats
}
