'use strict'
const Goal = require('../models/goal')

function getAll (req, res) {
  Goal.find({}, (err, goals) => {
    if(err) return res.status(500).send({message: err})
    if(!goals) return res.status(404).send({message: 'No goals found'})
  
    res.status(200).send({ goals })
  })
}

module.exports = {
  getAll
}