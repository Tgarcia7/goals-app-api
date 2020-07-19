const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const SALT_ROUNDS = 8

const UserSchema = new Schema({
  name: { type: String, required: true },
  avatar: String,
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  signupDate: { type: Date, default: Date.now() },
  status: { type: Number, enum: [1, 0], default: 1, select: false },
  facebook: String,
  github: String,
  google: String,
  lang: { type: String, enum: ['es', 'en'], default: 'es' },
  admin: { type: Number, enum: [1, 0], default: 0, select: false },
  goals: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  statistics: [{ type: Schema.Types.ObjectId, ref: 'Statistic' }],
  graphs: [{ type: Schema.Types.ObjectId, ref: 'Graph' }]
})

UserSchema.pre('save', function (next) {
  let user = this

  if (!user.isModified('password')) return next()

  bcrypt.hash(user.password, SALT_ROUNDS, function (err, hash) {
    if (err) return next(err)

    user.password = hash
    next()
  })
})

UserSchema.methods.comparePassword = function(candidatePassword) {
  let user = this
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password)
      .then(result => {
        resolve(result)
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports = mongoose.model('User', UserSchema, 'user')