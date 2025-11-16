import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IRefreshTokenUser {
  _id: Types.ObjectId
  name: string
  email: string
  admin: number
}

export interface IRefreshTokenDocument extends Document {
  token: string
  user: IRefreshTokenUser | null
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>({
  token: { type: String, required: true },
  user: { type: Object, default: null }
})

const RefreshToken: Model<IRefreshTokenDocument> = mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema, 'refreshToken')

export default RefreshToken
