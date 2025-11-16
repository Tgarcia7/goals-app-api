import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IGraphDocument extends Document {
  title: string
  type: string
  byYear: boolean
  labels: unknown[]
  data: Record<string, unknown>
  userId: Types.ObjectId
}

const GraphSchema = new Schema<IGraphDocument>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  byYear: { type: Boolean, default: false },
  labels: { type: Array, required: true },
  data: { type: Object, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

const Graph: Model<IGraphDocument> = mongoose.model<IGraphDocument>('Graph', GraphSchema, 'graph')

export default Graph
