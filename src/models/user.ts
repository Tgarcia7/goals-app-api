import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 8

export interface IUserDocument extends Document {
  name: string
  avatar: string | null
  email: string
  password: string
  signupDate: Date
  status: number
  facebook: string | null
  github: string | null
  google: string | null
  lang: 'es' | 'en'
  admin: number
  comparePassword(candidatePassword: string): Promise<boolean>
  transform(): Record<string, unknown>
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  signupDate: { type: Date, default: Date.now },
  status: { type: Number, enum: [1, 0], default: 1, select: false },
  facebook: { type: String, default: null },
  github: { type: String, default: null },
  google: { type: String, default: null },
  lang: { type: String, enum: ['es', 'en'], default: 'es' },
  admin: { type: Number, enum: [1, 0], default: 0 }
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    this.password = await hashPassword(this.password)
    next()
  } catch (error) {
    return next(error as Error)
  }
})

UserSchema.pre('updateOne', async function (next) {
  const update = this.getUpdate() as { password?: string } | null

  if (update && !update.password) return next()

  try {
    if (update && update.password) {
      update.password = await hashPassword(update.password)
    }
    next()
  } catch (error) {
    return next(error as Error)
  }
})

UserSchema.method('comparePassword', function(candidatePassword: string): Promise<boolean> {
  const user = this as IUserDocument
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password)
      .then(result => {
        resolve(result)
      })
      .catch(error => {
        reject(error)
      })
  })
})

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
      if (err) return reject(err)

      resolve(hash)
    })
  })
}

UserSchema.method('transform', function () {
  const obj = this.toObject() as Record<string, unknown>

  obj.id = obj._id
  delete obj._id

  return obj
})

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema, 'user')

export default User
