'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatisticSchema = new Schema({
  name: { type: String, required: true },
  total: { type: Number, required: true },
  sign: { type: String, default: null },
  icon: { type: Array, required: true },
  color: { type: String, default: null },
  description: { type: String, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

StatisticSchema.method('transform', function () {
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

  // Convert total to string as expected by frontend
  obj.total = String(obj.total)

  // Ensure sign has a default empty string
  if (obj.sign === null) {
    obj.sign = ''
  }

  // Ensure color has a default
  if (obj.color === null) {
    obj.color = '#000000'
  }

  // Ensure description has a default
  if (obj.description === null) {
    obj.description = ''
  }

  return obj
})

module.exports = mongoose.model('Statistic', StatisticSchema, 'statistic')
