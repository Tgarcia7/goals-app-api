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
    const filter = { status: 1 }
    const excludedFields = { __v: 0, password: 0, signupDate: 0 }
    const users = await User.find(filter, excludedFields)
    
    res.status(200).send(users)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function findById (req, res) {
  try {
    const filter = { '_id': ObjectId(req.params.id) }
    const excludedFields = { __v: 0, password: 0, signupDate: 0 }
    const user = await User.find(filter, excludedFields)

    if (!user) return res.status(404).send({ message: 'Not found' })
    
    res.status(200).send(user[0].transform()) 
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error }) 
  }
}

async function update (req, res) {
  try {
    delete req.body['password']
    const updateResult = await User.updateOne({ _id: ObjectId(req.params.id) }, req.body)

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.nModified })
  } catch (error) {
    console.error(error)
    if (error && error.code === 11000) {
      res.status(409).send({ message: 'Email duplicated' })
    } else {
      res.status(500).send({ message: `Error creating the user. ${error}` })
    }
  }
}

async function deleteOne (req, res) {
  try {
    const filter = { '_id': ObjectId(req.params.id) } 
    const deleteResult = await User.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
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
    const jwt = tokenService.createToken(user)

    const statsPromises = [
      initialStats(user._id), 
      initialGraphs(user._id)
    ]

    await Promise.all(statsPromises)

    res.status(201).send({ token: jwt })
  } catch (error) {
    console.error(error)
    if (error && error.code === 11000) {
      res.status(409).send({ message: 'Email duplicated' })
    } else {
      res.status(500).send({ message: `Error creating the user. ${error}` })
    }
  }
}

async function signIn (req, res) {
  const { password, email } = req.body
  if ( !password || !email ) return res.status(400).send({ message: 'Missing params' })

  try {
    const filter = { email: email }
    const user = await User.findOne(filter)

    if (!user) return res.status(401).send({ message: 'Unauthorized' })
    
    const found = await user.comparePassword(password)
    if (!found) return res.status(401).send({ message: 'Unauthorized' })
    
    const refreshToken = await addRefreshToken(user)
    const token = tokenService.createToken(user)

    res.status(200).send({ message: 'Authenticated', token, refreshToken })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function changePassword (req, res) {
  const { password, email, newPassword } = req.body
  if ( !password || !email || !newPassword ) return res.status(400).send({ message: 'Missing params' })

  try {
    const filter = { email: email }
    const user = await User.findOne(filter)

    if ( !Object.keys(user).length ) return res.status(401).send({ message: 'Unauthorized' })
    
    const found = await user.comparePassword(password)
    if (!found) return res.status(401).send({ message: 'Unauthorized' })
    
    const updateResult = await User.updateOne({ _id: ObjectId(req.params.id) }, { password: newPassword })

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.nModified })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error', error })
  }
}

async function refreshToken (req, res) {
  const { refreshToken, email } = req.body
  if ( !refreshToken || !email ) return res.status(400).send({ message: 'Missing params' })

  try {
    const filter = { token: refreshToken, 'user.email': email }
    const tokenFound = await RefreshToken.findOne(filter)

    if (tokenFound) {
      const token = tokenService.createToken(tokenFound.user)
      res.status(200).send({ message: token })
    } else {
      res.status(400).send({ message: 'Bad request' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: `Server error: ${error}` })
  }
}

async function addRefreshToken (user) {
  try {
    const filter = { 'user.email': user.email }
    const refreshToken = await RefreshToken.findOne(filter)

    if (refreshToken) return refreshToken.token
    
    const newRefreshToken = new RefreshToken({
      token: uuid.v4(),
      user: { 
        _id: user._id,
        name: user.name,
        email: user.email,
        admin: user.admin
      }
    })

    newRefreshToken.save()

    return newRefreshToken.token  
  } catch (error) {
    return error
  }
}

async function deleteRefreshToken (req, res) {
  try {
    if ( !req.user.admin ) return res.status(401).send({ message: 'Unauthorized' }) 

    const filter = { token: req.params.id }
    const deleteResult = await RefreshToken.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
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