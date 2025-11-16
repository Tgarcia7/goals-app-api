'use strict'

const config = require('./config')
const app = require('./app')
require('./models/db')

const server = app.listen(config.PORT, () => {
  console.info(`Goals api-${config.NODE_ENV} listening on port ${config.PORT}`)
})

module.exports = server
