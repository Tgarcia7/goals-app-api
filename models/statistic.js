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

module.exports = mongoose.model('Statistic', StatisticSchema, 'statistic')
