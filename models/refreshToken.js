const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RefreshTokenSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Object, default: null }
})

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema, 'refreshToken')