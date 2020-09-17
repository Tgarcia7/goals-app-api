require('dotenv').config()

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DB_URI: process.env.DB_URI,
  SECRET_TOKEN: process.env.SECRET_TOKEN
}