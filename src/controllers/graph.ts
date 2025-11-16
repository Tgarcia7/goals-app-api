import { Response } from 'express'
import Graph from '../models/graph'
import { ObjectId } from 'mongodb'
import * as utils from '../utils/index'
import { AuthenticatedRequest } from '../types'
import { Types } from 'mongoose'

async function add(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!utils.JSONStringValidate(req.body.data) || !utils.JSONStringValidate(req.body.labels)) {
    res.status(400).send({ message: 'Bad request' })
    return
  }

  try {
    const graph = new Graph({
      title: req.body.title,
      type: req.body.type,
      byYear: req.body.byYear,
      labels: JSON.parse(req.body.labels),
      data: JSON.parse(req.body.data),
      userId: new Types.ObjectId(req.user!.userId) // Use authenticated user
    })

    const newGraph = await graph.save()

    res.status(201).send({ message: 'Graph added', graph: newGraph })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function findByUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filter = { userId: new Types.ObjectId(req.user!.userId) }
    const graphs = await Graph.find(filter)

    if (!graphs.length) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(graphs)
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

    const filter = {
      _id: new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId) // IDOR protection
    }
    const graph = await Graph.findOne(filter)

    if (!graph) {
      res.status(404).send({ message: 'Not found' })
      return
    }

    res.status(200).send(graph)
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

    if (req.body.data) req.body.data = JSON.parse(req.body.data)

    // IDOR protection: only update if owned by user
    const filter = {
      '_id': new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId)
    }
    const updateResult = await Graph.updateOne(filter, req.body)

    if (updateResult.matchedCount === 0) {
      res.status(404).send({ message: 'Not found or unauthorized' })
      return
    }

    res.status(200).send({ message: 'Update completed', updatedRows: updateResult.modifiedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function deleteOne(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).send({ message: 'Invalid ID format' })
      return
    }

    // IDOR protection: only delete if owned by user
    const filter = {
      '_id': new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user!.userId)
    }
    const deleteResult = await Graph.deleteOne(filter)

    if (deleteResult.deletedCount === 0) {
      res.status(404).send({ message: 'Not found or unauthorized' })
      return
    }

    res.status(200).send({ message: 'Delete completed', deletedRows: deleteResult.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Server error' })
  }
}

async function initialGraphs(userId: Types.ObjectId): Promise<void> {
  const graph1 = new Graph({
    title: 'Metas en proceso',
    type: 'Bar',
    byYear: false,
    labels: ['A tiempo', 'Vencidas'],
    data: [0, 0, 0],
    userId
  })

  const graph2 = new Graph({
    title: 'Metas por tipo',
    type: 'Doughnut',
    byYear: false,
    data: [0, 0, 0],
    labels: ['Pasos', 'Simple', 'Objetivo'],
    userId
  })

  const graph3 = new Graph({
    title: 'Metas completadas',
    type: 'Line',
    byYear: true,
    labels: [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    data: {},
    userId
  })

  const currentYear = `${new Date().getFullYear()}`
  graph3.data[currentYear] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  const graphsPromises = [
    graph1.save(),
    graph2.save(),
    graph3.save()
  ]

  await Promise.all(graphsPromises)
}

export {
  add,
  findByUser,
  findById,
  update,
  deleteOne,
  initialGraphs
}
