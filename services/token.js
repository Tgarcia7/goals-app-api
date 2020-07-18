'use strict'
const jwt = require('jsonwebtoken')
const moment = require('moment')
const config = require('../config')

function createToken(user) {
  const payload = {
    sub: { 
      userId: user._id, 
      name: user.name, 
      email: user.email 
    },
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  }

  return jwt.sign(payload, config.SECRET_TOKEN)
}

function decodeToken(token) {
  const decoded = new Promise((resolve, reject) => {
    try {
      const payload = jwt.verify(token, config.SECRET_TOKEN)

      resolve(payload.sub)
    } catch (err) {
      let errorCode = err.name === 'TokenExpiredError' ? 401 : 500

      reject({ status: errorCode, message: err.name })
    }
  })

  return decoded
}

module.exports = {
  createToken,
  decodeToken
}