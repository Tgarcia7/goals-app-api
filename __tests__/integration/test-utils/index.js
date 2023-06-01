'use strict'

const config = require('../../../config')
const axios = require('axios')

const apiBaseUrl = 'http://api:3000'
const testUser = {
  name: 'testUser',
  email: 'test@test.com',
  password: 'abcd',
  admin: 1,
}
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 1000,
  validateStatus: status => status >= 200 && status < 500
})

async function getTestToken() {
  return await createUser(testUser)
}

async function createUser(userData) {
  const res = 
    await axios.post(
      `${apiBaseUrl}/signup`,
      userData,
      { headers: {'Authorization': 'Bearer ' + config.TEST_TOKEN} }
    )

  return res.data.token
}

module.exports = {
  axios: axiosInstance,
  getTestToken,
  testUser
}
