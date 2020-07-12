'use strict'
const User = require('../models/user')
const tokenService = require('../services/token')
const ObjectId = require('mongodb').ObjectID

function findAll (req, res) {
  let filter = { status: 1 }

  User.find(filter, req.body)
    .then(users => {
      if (!users.length) return res.status(404).send({ message: 'Not found' })
      res.status(200).send(users)
    })
    .catch (err => {
      res.status(500).send({ message: 'Server error', err })
    })
}

function findById (req, res) {
  if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

  let filter = { '_id': ObjectId(req.params.id) }

  User.findById(filter, req.body)
    .then(user => {
      if (!user) return res.status(404).send({ message: 'Not found' })
      res.status(200).send(user)
    })
    .catch (err => {
      res.status(500).send({ message: 'Server error', err })
    })
}

function update (req, res) {
  if ( (req.body && !Object.keys(req.body).length) || 
    (req.params && !req.params.id) ) return res.status(400).send({ message: 'Missing params' })

  let filter = { '_id': ObjectId(req.params.id) }

  User.updateOne(filter, req.body)
    .then(result => {
      res.status(200).send({ message: 'Update completed', updatedRows: result.nModified })
    })
    .catch (err => {
      res.status(500).send({ message: 'Server error', err })
    })
}

function deleteOne (req, res) {
  if ( req.params && !req.params.id ) return res.status(400).send({ message: 'Missing params' })

  let filter = { '_id': ObjectId(req.params.id) }

  User.deleteOne(filter)
    .then(result => {
      res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
    })
    .catch (err => {
      res.status(500).send({ message: 'Server error', err })
    })
}

function deleteAll (req, res) {
  User.deleteMany({})
    .then(result => {
      res.status(200).send({ message: 'Delete completed', deletedRows: result.deletedCount })
    })
    .catch (err => {
      res.status(500).send({ message: 'Server error', err })
    })
}

function signUp (req, res){
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: 'abdcfasdlkfjñ',
    jwt: ''
  })

  user.jwt = tokenService.createToken(user)

  user.save((error) => {
    let errorMsg = error && error.code === 11000 ? 'Email duplicated' : 'Error creating the user: '
    if (error) return res.status(500).send({ message: errorMsg, error })
    
    return res.status(201).send({ token: user.jwt })
  })
}

function signIn (req, res) {
  User.find({ email: req.body.email, password: req.body.password }, (error, user) => {
    if (error) return res.status(500).send({ message: error })
    if (user && user.length === 0) return res.status(404).send({ message: 'Unauthorized' })
  
    res.status(200).send({
      message: 'User authenticated', 
      token: tokenService.createToken(user)
    })
  })
}

module.exports = {
  findAll,
  findById,
  signUp,
  signIn,
  update,
  deleteOne, 
  deleteAll
}