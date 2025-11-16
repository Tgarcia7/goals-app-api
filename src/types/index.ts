import { Request } from 'express'
import { Types } from 'mongoose'

export interface UserPayload {
  userId: string
  name: string
  email: string
  admin: boolean
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload
}

export interface TokenPayload {
  sub: UserPayload
  iat: number
  exp: number
}

export interface TokenError {
  status: number
  message: string
}

export interface IUser {
  _id: Types.ObjectId
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
}

export interface IGoal {
  _id: Types.ObjectId
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
}

export interface IGraph {
  _id: Types.ObjectId
  title: string
  type: string
  byYear: boolean
  labels: unknown[]
  data: Record<string, unknown>
  userId: Types.ObjectId
}

export interface IStatistic {
  _id: Types.ObjectId
  name: string
  total: number
  sign: string | null
  icon: unknown[]
  color: string | null
  description: string | null
  userId: Types.ObjectId
}

export interface IRefreshToken {
  _id: Types.ObjectId
  token: string
  user: {
    _id: Types.ObjectId
    name: string
    email: string
    admin: number
  } | null
}

export interface TransformableDocument {
  transform(): Record<string, unknown>
}

export interface UserDocument extends IUser, TransformableDocument {
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface GoalDocument extends IGoal, TransformableDocument {}

export interface Config {
  PORT: number | string
  NODE_ENV: string
  DB_URI: string
  DB_NAME: string
  SECRET_TOKEN: string
  TEST_TOKEN?: string
}
