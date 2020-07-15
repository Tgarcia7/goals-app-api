'use strict'
const User = require('../models/user')
const tokenService = require('../services/token')
const ObjectId = require('mongodb').ObjectID

async function findAll (req, res) {
  try {
    let filter = { status: 1 }

    let users = await User.find(filter)
    if (!Object.keys(users).length) return res.status(404).send({ message: 'Not found' })
    res.status(200).send(users)

  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    if (req.params && !req.params.id) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }
  
    let user = await User.find(filter).populate('goals').populate('statistics').populate('graphs')
    if (!user) return res.status(404).send({ message: 'Not found' })
    res.status(200).send(user) 
  } catch (error) {
    res.status(500).send({ message: 'Server error', error }) 
  }
}

async function update (req, res) {
  try {
    if ( (req.body && !Object.keys(req.body).length) || 
      (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }

    let result = await User.updateOne(filter, req.body)
    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })

  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteOne (req, res) {
  try {
    if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) }

    let result = await User.deleteOne(filter)
    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })

  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function deleteAll (req, res) {
  try {
    let result = await User.deleteMany({})
    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })

  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function signUp (req, res) {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: 'abdcfasdlkfjñ',
      jwt: ''
    })
  
    user.jwt = tokenService.createToken(user)

    await user.save()
    res.status(201).send({ token: user.jwt })
  } catch (error) {
    let errorMsg = error && error.code === 11000 ? 'Email duplicated' : 'Error creating the user: '
    res.status(500).send({ message: errorMsg, error })
  }
}

async function signIn (req, res) {
  try {
    let filter = { email: req.body.email, password: req.body.password }

    let user = await User.find(filter)
    if (!Object.keys(user).length) return res.status(404).send({ message: 'Unauthorized' })
    
    res.status(200).send({
      message: 'User authenticated', 
      token: tokenService.createToken(user)
    })

  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

function pushGoal (userId, goalId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.updateOne({ '_id': userId }, { $addToSet: { 'goals': goalId } })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

function pushStatistic (userId, statisticId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.updateOne({ '_id': userId }, { $addToSet: { 'statistics': statisticId } })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

function pushGraph (userId, graphId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.updateOne({ '_id': userId }, { $addToSet: { 'graphs': graphId } })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  findAll,
  findById,
  signUp,
  signIn,
  update,
  deleteOne, 
  deleteAll,
  pushGoal,
  pushStatistic,
  pushGraph
}