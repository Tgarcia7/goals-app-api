'use strict'

// Validate required environment variables
const requiredEnvVars = ['DB_URI', 'DB_NAME', 'SECRET_TOKEN']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`)
  }
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DB_URI: process.env.DB_URI,
  DB_NAME: process.env.DB_NAME,
  SECRET_TOKEN: process.env.SECRET_TOKEN,
  TEST_TOKEN: process.env.TEST_TOKEN,
}
