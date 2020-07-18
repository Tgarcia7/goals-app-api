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

async function signUp (req, res) {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
  
    await user.save()
    let jwt = tokenService.createToken(user)

    res.status(201).send({ token: jwt })
  } catch (error) {
    let errorMsg = error && error.code === 11000 ? 'Email duplicated' : `Error creating the user. ${error}`
    res.status(500).send({ message: errorMsg })
  }
}

async function signIn (req, res) {
  if ( req.body && (!req.body.password || !req.body.email) ) 
    return res.status(400).send({ message: 'Missing params' })

  try {
    let filter = { email: req.body.email }

    let user = await User.findOne(filter)
    if (!Object.keys(user).length) return res.status(401).send({ message: 'Unauthorized' })
    
    let found = await user.comparePassword(req.body.password)
    if (!found) return res.status(401).send({ message: 'Unauthorized' })
    
    res.status(200).send({ message: 'Authenticated', token: tokenService.createToken(user) })
  } catch (error) {
    console.log(error)
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

function pullGraph (graphId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.update({ 'graphs': ObjectId(graphId) }, { $pull: { 'graphs': graphId } })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

function pullStatistic (statisticId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.update({ 'statistics': ObjectId(statisticId) }, { $pull: { 'statistics': statisticId } })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

function pullGoal (goalId) {
  return new Promise (async (resolve, reject) => {
    try {
      await User.update({ 'goals': ObjectId(goalId) }, { $pull: { 'goals': goalId } })
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
  pushGoal,
  pushStatistic,
  pushGraph,
  pullGraph,
  pullStatistic,
  pullGoal
}