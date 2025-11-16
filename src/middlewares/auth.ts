import { Response, NextFunction } from 'express'
import * as services from '../services/token'
import { AuthenticatedRequest, TokenError } from '../types'

function isAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized' })
    return
  }

  // Extract token from headers
  const token = req.headers.authorization.split(' ')[1]

  // Decodes and validates the token
  services.decodeToken(token)
    .then(response => {
      req.user = response
      next()
    })
    .catch((response: TokenError) => {
      res.status(response.status).send({ message: response.message })
    })
}

export default isAuth
