const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: { type: String, required: true },
  avatar: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true  },
  signupDate: { type: Date, default: Date.now() },
  status: { type: Number, enum: [1, 0], default: 1 },
  facebook: String, 
  github: String, 
  google: String,
  lang: { type: String, enum: ['es', 'en'], default: 'es' }
})

module.exports = mongoose.model('User', UserSchema)