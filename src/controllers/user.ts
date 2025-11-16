import { Response } from 'express'
import User from '../models/user'
import RefreshToken from '../models/refreshToken'
import * as tokenService from '../services/token'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { initialStats } from './statistic'
import { initialGraphs } from './graph'
import { AuthenticatedRequest } from '../types'
import { IUserDocument } from '../models/user'
import { Types } from 'mongoose'

interface MongoError extends Error {
  code?: number
}

async function findAll(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filter = { status: 1 }
    const excludedFields = { __v: 0, password: 0, signupDate: 0 }
    const users = await User.find(filter, excludedFields)

    res.status(200).send(users)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    const filter = { '_id': new Types.ObjectId(req.params.id) }
    const excludedFields = { __v: 0, password: 0, signupDate: 0 }
    const user = await User.findOne(filter, excludedFields)

    if (!user) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(user.transform())
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    delete req.body['password']
    const updateResult = await User.updateOne({ _id: new Types.ObjectId(req.params.id) }, req.body)

    if (updateResult.matchedCount === 0) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.modifiedCount })
  } catch (error) {
    console.error(error)
    const mongoError = error as MongoError
    if (mongoError && mongoError.code === 11000) {
      res.status(409).send({ message: 'Email duplicated' })
    } else {
      res.status(500).send({ message: 'Server error' })
    }
  }
}

async function deleteOne(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    const filter = { '_id': new Types.ObjectId(req.params.id) }
    const deleteResult = await User.deleteOne(filter)

    if (deleteResult.deletedCount === 0) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function signUp(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      admin: req.body.admin
    })

    await user.save()
    const jwt = tokenService.createToken(user)

    const statsPromises = [
      initialStats(user._id as Types.ObjectId),
      initialGraphs(user._id as Types.ObjectId)
    ]

    await Promise.all(statsPromises)

    res.status(201).send({ token: jwt })
  } catch (error) {
    console.error(error)
    const mongoError = error as MongoError
    if (mongoError && mongoError.code === 11000) {
      res.status(409).send({ message: 'Email duplicated' })
    } else {
      res.status(500).send({ message: 'Server error' })
    }
  }
}

async function signIn(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { password, email } = req.body
  if (!password || !email) {
    res.status(400).send({ message: 'Missing params' })
    return
  }

  try {
    const filter = { email: email }
    const user = await User.findOne(filter)

    if (!user) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    const found = await user.comparePassword(password)
    if (!found) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    const refreshTokenValue = await addRefreshToken(user)
    const token = tokenService.createToken(user)

    res.status(200).send({ message: 'Authenticated', token, refreshToken: refreshTokenValue })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { password, email, newPassword } = req.body
  if (!password || !email || !newPassword) {
    res.status(400).send({ message: 'Missing params' })
    return
  }

  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    const filter = { email: email }
    const user = await User.findOne(filter)

    if (!user) {
      res.status(400).send({ message: 'Bad request' })
      return
    }

    const found = await user.comparePassword(password)
    if (!found) {
      res.status(400).send({ message: 'Bad request' })
      return
    }

    const updateResult = await User.updateOne({ _id: new Types.ObjectId(req.params.id) }, { password: newPassword })

    if (updateResult.matchedCount === 0) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.modifiedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { refreshToken, email } = req.body
  if (!refreshToken || !email) {
    res.status(400).send({ message: 'Missing params' })
    return
  }

  try {
    const filter = { token: refreshToken, 'user.email': email }
    const tokenFound = await RefreshToken.findOne(filter)

    if (tokenFound && tokenFound.user) {
      const token = tokenService.createToken(tokenFound.user)
      res.status(200).send({ message: token })
    } else {
      res.status(401).send({ message: 'Unauthorized' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function addRefreshToken(user: IUserDocument): Promise<string> {
  const filter = { 'user.email': user.email }
  const existingRefreshToken = await RefreshToken.findOne(filter)

  if (existingRefreshToken) return existingRefreshToken.token

  const newRefreshToken = new RefreshToken({
    token: uuidv4(),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin
    }
  })

  await newRefreshToken.save()

  return newRefreshToken.token
}

async function deleteRefreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.admin) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    const filter = { token: req.params.id }
    const deleteResult = await RefreshToken.deleteOne(filter)

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

export {
  findAll,
  findById,
  signUp,
  signIn,
  update,
  deleteOne,
  refreshToken,
  deleteRefreshToken,
  changePassword
}
