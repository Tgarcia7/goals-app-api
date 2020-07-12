const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: { type: String, required: true },
  avatar: String,
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true  },
  signupDate: { type: Date, default: Date.now() },
  status: { type: Number, enum: [1, 0], default: 1, select: false },
  facebook: String, 
  github: String, 
  google: String,
  lang: { type: String, enum: ['es', 'en'], default: 'es' },
  jwt: String,
  goals: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  statistics: [{ type: Schema.Types.ObjectId, ref: 'Statistic' }]
})

module.exports = mongoose.model('User', UserSchema, 'user')