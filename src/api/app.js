// @flow
import connectMongoose from '../db/mongoose'
import { opbeat, trackRelease } from '../opbeat'
import path from 'path'
import YAML from 'yamljs'
import swaggerTools from 'swagger-tools'
import { logError, StatusError } from '../utils/error'
import express from 'express'
import type { Application, Request } from './types'
import jwksRsa from 'jwks-rsa'
import jwt from 'jsonwebtoken'
import Debug from 'debug'
connectMongoose()
const debug = Debug('laundree:api.app')

const app: Application = express()

const rsaClient = jwksRsa({
  cache: true,
  jwksUri: 'https://laundree-test.eu.auth0.com/.well-known/jwks.json' // TODO change
})

const audience = 'https://laundree.io/api'

function decodeToken (token) {
  return jwt.decode(token, {complete: true})
}

function fetchSigningKey (kid) {
  return new Promise((resolve, reject) => {
    rsaClient.getSigningKey(kid, (err, key) => {
      if (err) return reject(err)
      resolve(key.publicKey || key.rsaPublicKey)
    })
  })
}

function verifyJwt (token, key) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, {audience}, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded)
    })
  })
}

async function auth0 (req, authOrSecDef, scopesOrApiKey, callback) {
  const authHeader = req.header('authorization')
  const match = authHeader && authHeader.match(/^Bearer (.+)$/)
  const token = match && match[1]
  debug('Verifying token %s', token)
  if (!token) {
    callback(new StatusError('Token not found', 401))
    return
  }
  try {
    const decoded = decodeToken(token)
    debug('Decoded successfully')
    const k = await fetchSigningKey(decoded.header.kid)
    debug('Fetched signing key successfully')
    req.jwt = await verifyJwt(token, k)
    debug('Verified successfully')
    callback()
  } catch (err) {
    debug('Failed verification with error  %s', err)
    callback(new StatusError('Invalid token', 401))
  }
}

export default new Promise((resolve) => {
  YAML.load(path.join(__dirname, 'swagger', 'swagger.yaml'),
    (result) => {
      result.basePath = '/'
      swaggerTools.initializeMiddleware(result, (middleware) => {
        app.use(middleware.swaggerMetadata())
        app.use((req: Request, res, next) => {
          if (!opbeat) return next()
          if (!req.swagger || !req.swagger.apiPath) return next()
          opbeat.setTransactionName(`${req.method} ${req.swagger.apiPath}`)
          next()
        })
        app.use(middleware.swaggerSecurity({
          auth0
        }))
        app.use(middleware.swaggerValidator({validateResponse: true}))
        app.use(middleware.swaggerRouter({controllers: path.join(__dirname, 'controllers')}))
        app.get('/', (req: Request, res, next) => {
          const err: Error = new StatusError('Not found', 404)
          next(err)
        })
        app.use((err, req: Request, res, next) => {
          const status = (typeof err.status === 'number' && err.status) || 500
          res.status(status)
          if (status !== 500) {
            res.json({message: err.message})
            return
          }
          logError(err)
          res.json({message: 'Internal server error'})
        })
        resolve(app)
      })
    })
})

trackRelease()
