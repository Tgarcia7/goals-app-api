import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IStatisticDocument extends Document {
  name: string
  total: number
  sign: string | null
  icon: unknown[]
  color: string | null
  description: string | null
  userId: Types.ObjectId
  transform(): Record<string, unknown>
}

const StatisticSchema = new Schema<IStatisticDocument>({
  name: { type: String, required: true },
  total: { type: Number, required: true },
  sign: { type: String, default: null },
  icon: { type: Array, required: true },
  color: { type: String, default: null },
  description: { type: String, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

StatisticSchema.method('transform', function (this: IStatisticDocument) {
  const obj = this.toObject() as Record<string, unknown>

  // Convert MongoDB ObjectId to numeric ID using timestamp
  const id = obj._id as Types.ObjectId
  if (id && typeof id.getTimestamp === 'function') {
    obj.id = id.getTimestamp().getTime()
  } else {
    obj.id = Date.now()
  }
  delete obj._id
  delete obj.__v
  delete obj.userId

  // Convert total to string as expected by frontend
  obj.total = String(obj.total)

  // Ensure sign has a default empty string
  if (obj.sign === null) {
    obj.sign = ''
  }

  // Ensure color has a default
  if (obj.color === null) {
    obj.color = '#000000'
  }

  // Ensure description has a default
  if (obj.description === null) {
    obj.description = ''
  }

  return obj
})

const Statistic: Model<IStatisticDocument> = mongoose.model<IStatisticDocument>('Statistic', StatisticSchema, 'statistic')

export default Statistic
