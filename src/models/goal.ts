import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IGoalDocument extends Document {
  title: string
  icon: unknown[]
  date: Date | null
  objectiveDone: number | null
  objectiveTotal: number | null
  type: 'objective' | 'simple' | 'steps'
  status: number
  progress: 'doing' | 'done'
  stepsList: unknown[]
  dateCompleted: Date | null
  dateCreated: Date
  userId: Types.ObjectId
  transform(): Record<string, unknown>
}

const GoalSchema = new Schema<IGoalDocument>({
  title: { type: String, required: true },
  icon: { type: Array, required: true },
  date: { type: Date, default: null },
  objectiveDone: { type: Number, default: null },
  objectiveTotal: { type: Number, default: null },
  type: { type: String, enum: ['objective', 'simple', 'steps'], required: true },
  status: { type: Number, default: 1 },
  progress: { type: String, enum: ['doing', 'done'], default: 'doing' },
  stepsList: { type: Array, default: [] },
  dateCompleted: { type: Date, default: null },
  dateCreated: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

GoalSchema.method('transform', function () {
  const obj = this.toObject() as Record<string, unknown>

  obj.id = obj._id
  delete obj._id

  return obj
})

const Goal: Model<IGoalDocument> = mongoose.model<IGoalDocument>('Goal', GoalSchema, 'goal')

export default Goal
