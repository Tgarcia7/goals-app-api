'use strict'
const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
const tokenService = require('../services/token')
const ObjectId = require('mongodb').ObjectID
const uuid = require('uuid')
const { initialStats } = require('./statistic')
const { initialGraphs } = require('./graph')

async function findAll (req, res) {
  try {
    let filter = { status: 1 },
      fields = { __v: 0, password: 0, signupDate: 0 }

    let users = await User.find(filter, fields)
    if (!Object.keys(users).length) return res.status(404).send({ message: 'Not found' })
    
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    if (req.params && !req.params.id) return res.status(400).send({ message: 'Missing params' })

    let filter = { '_id': ObjectId(req.params.id) },
      fields = { __v: 0, password: 0, signupDate: 0 },
      user = await User.find(filter, fields)

    if (!user) return res.status(404).send({ message: 'Not found' })
    res.status(200).send(user) 
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error }) 
  }
}

async function update (req, res) {
  try {
    if ( (req.body && !Object.keys(req.body).length) || 
      (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

    delete req.body['password']
    let result = await User.updateOne({ _id: ObjectId(req.params.id) }, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
  } catch (error) {
    console.error(error)
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
      password: req.body.password,
      admin: req.body.admin
    })
  
    await user.save()
    let jwt = tokenService.createToken(user)

    const statsPromises = [
      initialStats(user._id), 
      initialGraphs(user._id)
    ]

    await Promise.all(statsPromises)

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
    if (!user || !Object.keys(user).length) return res.status(401).send({ message: 'Unauthorized' })
    
    let found = await user.comparePassword(req.body.password)
    if (!found) return res.status(401).send({ message: 'Unauthorized' })
    
    let refreshToken = await addRefreshToken(user),
      token = tokenService.createToken(user)

    res.status(200).send({ message: 'Authenticated', token, refreshToken })
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function changePassword (req, res) {
  if ( req.body && (!req.body.password || !req.body.email || !req.body.newPassword) ) 
    return res.status(400).send({ message: 'Missing params' })

  try {
    let filter = { email: req.body.email }

    let user = await User.findOne(filter)
    if (!user || !Object.keys(user).length) return res.status(401).send({ message: 'Unauthorized' })
    
    let found = await user.comparePassword(req.body.password)
    if (!found) return res.status(401).send({ message: 'Unauthorized' })
    
    let result = await User.updateOne({ _id: ObjectId(req.params.id) }, { password: req.body.newPassword })

    res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function refreshToken (req, res) {
  if ( req.body && (!req.body.refreshToken || !req.body.email) ) 
    return res.status(400).send({ message: 'Missing params' })

  let filter = { token: req.body.refreshToken, 'user.email': req.body.email }

  try {
    let result = await RefreshToken.findOne(filter)

    if (result) {
      let token = tokenService.createToken(result.user)
      res.status(200).send({ message: token })
    } else {
      res.status(401).send({ message: 'Unauthorized' })
    }
  } catch (error) {
    res.status(500).send({ message: `Server error: ${error}` })
  }
}

async function addRefreshToken (user) {
  let filter = { 'user.email': user.email }
  let result = await RefreshToken.findOne(filter)

  if (result) {
    return result.token
  } else {
    const refreshTokenInst = new RefreshToken({
      token: uuid.v4(),
      user: { 
        name: user.name,
        email: user.email,
        password: user.password
      }
    })
  
    refreshTokenInst.save()
    return refreshTokenInst.token
  }
}

async function deleteRefreshToken (req, res) {
  try {
    if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })
    if ( !req.user.admin ) return res.status(401).send({ message: 'Unauthorized' }) 

    let filter = { token: req.params.id }
    let result = await RefreshToken.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
  } catch (error) {
    res.status(500).send({ message: 'Server error', error })
  }
}

module.exports = {
  findAll,
  findById,
  signUp,
  signIn,
  update,
  deleteOne, 
  refreshToken,
  deleteRefreshToken,
  changePassword
}