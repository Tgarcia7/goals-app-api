'use strict'
const User = require('../models/user')

function getAll(req, res) {
  User.find({}, (err, users) => {
    if(err) return res.status(500).send({message: err})
    if(!users) return res.status(404).send({message: 'No users found'})
  
    res.status(200).send({ users })
  })
}

module.exports = {
  getAll
}