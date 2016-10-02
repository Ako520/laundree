/**
 * Created by budde on 05/05/16.
 */
const Promise = require('promise')
var path = require('path')
var YAML = require('yamljs')
var swaggerTools = require('swagger-tools')
var config = require('config')
var passport = require('passport')
const {logError} = require('../utils/error')
const {opbeat} = require('../lib/opbeat')
const {TokenHandler, LaundryHandler, MachineHandler, BookingHandler, LaundryInvitationHandler, UserHandler} = require('../handlers')

function generateError (message, status) {
  const error = new Error(message)
  error.statusCode = status
  return error
}

/**
 * Pull the subject Id's from the request
 * Fails if resource is not found.
 * @returns {Promise}
 */
function pullSubjects (req) {
  return Promise
    .all([
      pullSubject(req, 'userId', UserHandler),
      pullSubject(req, 'machineId', MachineHandler),
      pullSubject(req, 'tokenId', TokenHandler),
      pullSubject(req, 'inviteId', LaundryInvitationHandler),
      pullSubject(req, 'laundryId', LaundryHandler),
      pullSubject(req, 'bookingId', BookingHandler)
    ])
    .then(([user, machine, token, invite, laundry, booking]) => ({
      user, machine, token, invite, laundry, booking
    }))
    .then(subjects => Object.keys(subjects).reduce((subs, key) => {
      if (!subjects[key]) return subs
      subs[key] = subjects[key]
      return subs
    }, {}))
}

function pullSubject (req, name, _Handler) {
  if (!req.swagger.params[name]) return Promise.resolve()
  const id = req.swagger.params[name].value
  return _Handler.findFromId(id).then(instance => {
    if (!instance) throw generateError('Not found', 404)
    return instance
  })
}

function userAccess (req) {
  if (!req.user) return Promise.reject(generateError('Invalid credentials', 403))
  return pullSubjects(req).then(subjects => Object.assign({user: req.user, currentUser: req.user}, subjects))
}

function self (req) {
  return userAccess(req).then(subjects => {
    if (subjects.currentUser.model.id !== subjects.user.model.id) throw generateError('Not allowed', 403)
    return subjects
  })
}

function tokenOwner (req) {
  return userAccess(req).then(subjects => {
    if (!subjects.token.isOwner(subjects.currentUser)) throw generateError('Not found', 404)
    return subjects
  })
}

function wrapSecurity (f) {
  return (req, def, scopes, callback) => f(req).then(subjects => {
    req.subjects = subjects
    callback()
  }, callback)
}

function laundryUser (req) {
  return userAccess(req).then(subjects => {
    if (!subjects.laundry.isUser(subjects.currentUser)) throw generateError('Not found', 404)
    return subjects
  })
}

function laundryOwner (req) {
  return laundryUser(req).then(subjects => {
    if (!subjects.laundry.isOwner(subjects.currentUser)) throw generateError('Not allowed', 403)
    return subjects
  })
}

function genericUserCheck (subjectName) {
  return (req) => userAccess(req).then(subjects => {
    const subject = subjects[subjectName]
    return LaundryHandler
      .findFromId(subject.model.laundry.toString())
      .then(laundry => {
        if (!laundry.isUser(subjects.currentUser)) throw generateError('Not found', 404)
        return Object.assign({laundry}, subjects)
      })
  })
}

function genericOwnerCheck (subjectName) {
  return (req) => genericUserCheck(subjectName)(req).then(subjects => {
    if (!subjects.laundry.isOwner(subjects.currentUser)) throw generateError('Not allowed', 403)
    return subjects
  })
}

function bookingCreator (req) {
  return userAccess(req).then(subjects => {
    if (!subjects.booking.isOwner(subjects.currentUser)) throw generateError('Not found', 404)
    return subjects
  })
}

function setup (app) {
  return new Promise((resolve, reject) => {
    YAML.load(path.join(__dirname, '..', 'api', 'swagger', 'swagger.yaml'),
      (result) => swaggerTools.initializeMiddleware(result, (middleware) => {
        app.use(middleware.swaggerMetadata())
        app.use((req, res, next) => {
          if (!opbeat) return next()
          if (!req.swagger || !req.swagger.apiPath) return next()
          opbeat.setTransactionName(`${req.method} /api${req.swagger.apiPath}`)
          next()
        })

        app.use((req, res, next) => {
          if (req.user) return next()
          passport.authenticate('basic', (err, user, info) => {
            if (err) return next(err)
            if (!user) return next()
            req.user = user
            next()
          })(req, res, next)
        })

        app.use(middleware.swaggerSecurity({
          subjectsExists: wrapSecurity(pullSubjects),
          userAccess: wrapSecurity(userAccess),
          self: wrapSecurity(self),
          tokenOwner: wrapSecurity(tokenOwner),
          laundryOwner: wrapSecurity(laundryOwner),
          laundryUser: wrapSecurity(laundryUser),
          machineOwner: wrapSecurity(genericOwnerCheck('machine')),
          machineUser: wrapSecurity(genericUserCheck('machine')),
          inviteOwner: wrapSecurity(genericOwnerCheck('invite')),
          bookingOwner: wrapSecurity(genericOwnerCheck('booking')),
          bookingUser: wrapSecurity(genericUserCheck('booking')),
          bookingCreator: wrapSecurity(bookingCreator)
        }))
        app.use(middleware.swaggerValidator({validateResponse: true}))
        app.use(middleware.swaggerRouter({controllers: path.join(__dirname, '..', 'api', 'controllers')}))
        app.use(middleware.swaggerUi())
        app.use('/api', (err, req, res, next) => {
          res.statusCode = res.statusCode && res.statusCode < 300 ? err.status || 500 : res.statusCode
          if (config.get('logging.error.enabled') && res.statusCode === 500) logError(err)
          res.json({message: err.message})
        })
        resolve(app)
      }))
  })
}
module.exports = setup
