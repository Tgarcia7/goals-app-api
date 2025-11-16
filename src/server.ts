import config from './config'
import app from './app'
import './models/db'

const server = app.listen(config.PORT, () => {
  console.info(`Goals api-${config.NODE_ENV} listening on port ${config.PORT}`)
})

export default server
