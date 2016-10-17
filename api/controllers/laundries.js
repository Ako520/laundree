const {LaundryHandler, UserHandler} = require('../../handlers')
const {api, mail} = require('../../utils')
/**
 * Created by budde on 02/06/16.
 */

function listLaundries (req, res) {
  const filter = {users: req.user.model._id}
  const limit = req.swagger.params.page_size.value
  const since = req.swagger.params.since.value
  if (since) {
    filter._id = {$gt: since}
  }
  LaundryHandler.find(filter, {limit, sort: {_id: 1}})
    .then((laundries) => laundries.map((laundry) => laundry.toRestSummary()))
    .then((laundries) => {
      var links = {
        first: `/api/laundries?page_size=${limit}`
      }
      if (laundries.length === limit) {
        links.next = `/api/laundries?since=${laundries[laundries.length - 1].id}&page_size=${limit}`
      }
      res.links(links)
      res.json(laundries)
    })
    .catch(api.generateErrorHandler(res))
}

function createLaundry (req, res) {
  const name = req.swagger.params.body.value.name.trim()
  LaundryHandler
    .find({name})
    .then(([laundry]) => {
      if (laundry) return api.returnError(res, 409, 'Laundry already exists', {Location: laundry.restUrl})
      return req.user.createLaundry(name)
        .then((laundry) => api.returnSuccess(res, laundry.toRest()))
    })
    .catch(api.generateErrorHandler(res))
}

function createDemoLaundry (req, res) {
  UserHandler
    .createDemoUser()
    .then(({user, email, password}) => LaundryHandler
      .createDemoLaundry(user)
      .then(() => api.returnSuccess(res, {email, password})))
    .catch(api.generateErrorHandler(res))
}

function updateLaundry (req, res) {
  const {laundry} = req.subjects
  const name = req.swagger.params.body.value.name.trim()
  if (name === laundry.model.name) return api.returnSuccess(res)
  LaundryHandler
    .find({name})
    .then(([l]) => {
      if (l) return api.returnError(res, 409, 'Laundry already exists', {Location: l.restUrl})
      return laundry.updateName(name).then(() => api.returnSuccess(res))
    })
    .catch(api.generateErrorHandler(res))
}

function fetchLaundry (req, res) {
  const laundry = req.subjects.laundry
  api.returnSuccess(res, laundry.toRest())
}

function deleteLaundry (req, res) {
  const laundry = req.subjects.laundry
  if (laundry.model.demo) return api.returnError(res, 403, 'Not allowed')
  laundry.deleteLaundry()
    .then(() => api.returnSuccess(res))
    .catch(api.generateErrorHandler(res))
}

function inviteUserByEmail (req, res) {
  const email = req.swagger.params.body.value.email
  const laundry = req.subjects.laundry
  if (laundry.model.demo) return api.returnError(res, 403, 'Not allowed')
  return laundry
    .inviteUserByEmail(email)
    .then(({user, invite}) => {
      if (user) return mail.sendEmail({email, laundry: laundry.model, user: user.model}, 'invite-user', email)
      if (invite) return mail.sendEmail({email, laundry: laundry.model}, 'invite', email)
    })
    .then(() => api.returnSuccess(res))
    .catch(api.generateErrorHandler(res))
}

function removeUserFromLaundry (req, res) {
  const {user, currentUser, laundry} = req.subjects
  if (!laundry.isUser(user)) return api.returnError(res, 403, 'Not allowed')
  if (laundry.isOwner(user)) return api.returnError(res, 403, 'Not allowed')
  if (!laundry.isOwner(currentUser) && user.model.id !== currentUser.model.id) return api.returnError(res, 403, 'Not allowed')
  laundry.removeUser(user)
    .then(() => api.returnSuccess(res))
    .catch(api.generateErrorHandler(res))
}

module.exports = {
  createDemoLaundry,
  inviteUserByEmail,
  listLaundries,
  updateLaundry,
  fetchLaundry,
  deleteLaundry,
  createLaundry,
  removeUserFromLaundry
}
