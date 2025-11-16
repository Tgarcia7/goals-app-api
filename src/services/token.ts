import jwt from 'jsonwebtoken'
import moment from 'moment'
import config from '../config'
import { UserPayload, TokenError } from '../types'

interface TokenUser {
  _id: unknown
  name: string
  email: string
  admin: number | boolean
}

interface JWTPayload {
  sub: UserPayload
  iat: number
  exp: number
}

function createToken(user: TokenUser): string {
  const isAdmin = !!user.admin

  const payload = {
    sub: {
      userId: user._id,
      name: user.name,
      email: user.email,
      admin: isAdmin
    },
    iat: moment().unix(),
    exp: moment().add(15, 'minutes').unix()
  }

  return jwt.sign(payload, config.SECRET_TOKEN, { algorithm: 'HS256' })
}

function decodeToken(token: string): Promise<UserPayload> {
  const decoded = new Promise<UserPayload>((resolve, reject) => {
    try {
      const payload = jwt.verify(token, config.SECRET_TOKEN, { algorithms: ['HS256'] }) as unknown as JWTPayload

      resolve(payload.sub)
    } catch (err) {
      const error = err as Error & { name: string }
      const errorCode = error.name === 'TokenExpiredError' ? 401 : 500

      reject({ status: errorCode, message: error.name } as TokenError)
    }
  })

  return decoded
}

export {
  createToken,
  decodeToken
}
