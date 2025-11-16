import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IGraphDocument extends Document {
  title: string
  type: string
  byYear: boolean
  labels: unknown[]
  data: Record<string, unknown>
  userId: Types.ObjectId
  transform(): Record<string, unknown>
}

const GraphSchema = new Schema<IGraphDocument>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  byYear: { type: Boolean, default: false },
  labels: { type: Array, required: true },
  data: { type: Object, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

GraphSchema.method('transform', function (this: IGraphDocument) {
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

  return obj
})

const Graph: Model<IGraphDocument> = mongoose.model<IGraphDocument>('Graph', GraphSchema, 'graph')

export default Graph
