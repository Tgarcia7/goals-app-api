'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GraphSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  byYear: { type: Boolean, default: false },
  labels: { type: Array, required: true },
  data: { type: Object, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

GraphSchema.method('transform', function () {
  let obj = this.toObject()

  // Convert MongoDB ObjectId to numeric ID using timestamp
  if (obj._id && typeof obj._id.getTimestamp === 'function') {
    obj.id = obj._id.getTimestamp().getTime()
  } else {
    obj.id = Date.now()
  }
  delete obj._id
  delete obj.__v
  delete obj.userId

  return obj
})

module.exports = mongoose.model('Graph', GraphSchema, 'graph')
