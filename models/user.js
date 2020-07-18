const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const saltRounds = 8

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
  goals: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  statistics: [{ type: Schema.Types.ObjectId, ref: 'Statistic' }],
  graphs: [{ type: Schema.Types.ObjectId, ref: 'Graph' }]
})

UserSchema.pre('save', function (next) {
  let user = this

  if (!user.isModified('password')) return next()

  bcrypt.hash(user.password, saltRounds, function (err, hash) {
    if (err) return next(err)

    user.password = hash
    next()
  })
})

UserSchema.methods.comparePassword = function(candidatePassword) {
  let user = this
  return new Promise(function (resolve, reject) {
    bcrypt.compare(candidatePassword, user.password)
      .then(function (result) {
        resolve(result)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports = mongoose.model('User', UserSchema, 'user')