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

module.exports = mongoose.model('Graph', GraphSchema, 'graph')
