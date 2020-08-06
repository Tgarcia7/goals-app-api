const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GoalSchema = new Schema({
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

module.exports = mongoose.model('Goal', GoalSchema, 'goal')