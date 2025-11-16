import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IStatisticDocument extends Document {
  name: string
  total: number
  sign: string | null
  icon: unknown[]
  color: string | null
  description: string | null
  userId: Types.ObjectId
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

const Statistic: Model<IStatisticDocument> = mongoose.model<IStatisticDocument>('Statistic', StatisticSchema, 'statistic')

export default Statistic
