const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatisticSchema = new Schema({
  name: { type: String, required: true },
  total: { type: Array, required: true },
  sign: String,
  icon: { type: Array, required: true },
  color: String,
  description: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Statistic', StatisticSchema, 'statistic')