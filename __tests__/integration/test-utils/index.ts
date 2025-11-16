import config from '../../../src/config'
import axiosLib, { AxiosInstance } from 'axios'

const apiBaseUrl = 'http://api:3000'

interface TestUser {
  name: string
  email: string
  password: string
  admin: number
}

const testUser: TestUser = {
  name: 'testUser',
  email: 'test@test.com',
  password: 'abcd',
  admin: 1,
}

const axiosInstance: AxiosInstance = axiosLib.create({
  baseURL: apiBaseUrl,
  timeout: 1000,
  validateStatus: (status: number) => status >= 200 && status < 500
})

async function getTestToken(): Promise<string> {
  return await createUser(testUser)
}

async function createUser(userData: TestUser): Promise<string> {
  const res = await axiosLib.post(
    `${apiBaseUrl}/signup`,
    userData,
    { headers: { 'Authorization': 'Bearer ' + config.TEST_TOKEN } }
  )

  return res.data.token
}

export {
  axiosInstance as axios,
  getTestToken,
  testUser
}
