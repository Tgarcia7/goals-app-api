const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Statistic', StatSchema)