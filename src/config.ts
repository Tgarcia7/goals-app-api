import { Config } from './types'

// Validate required environment variables (skip validation in test environment)
const isTestEnv = process.env.NODE_ENV === 'test'

if (!isTestEnv) {
  const requiredEnvVars = ['DB_URI', 'DB_NAME', 'SECRET_TOKEN']

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`)
    }
  }
}

const config: Config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'goals-test',
  SECRET_TOKEN: process.env.SECRET_TOKEN || 'test-secret-token',
  TEST_TOKEN: process.env.TEST_TOKEN,
}

export default config
