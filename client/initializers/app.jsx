/**
 * Created by budde on 28/05/16.
 */

const Initializer = require('./initializer')
const debug = require('debug')('laundree.initializers.app')
const Promise = require('promise')

const React = require('react')
const ReactDOM = require('react-dom')
const {IntlProvider} = require('react-intl')
const {Provider} = require('react-redux')
const {Router, browserHistory, match} = require('react-router')
const routeGenerator = require('../../react/routes')
const io = require('socket.io-client')
const {createStore} = require('redux')
const {reducer} = require('../../redux')
const reduxActions = require('../../redux/actions')
const {ActionProvider} = require('../../react/views/providers')
const {UserClientApi, LaundryClientApi, MachineClientApi, BookingClientApi, InviteClientApi} = require('../api')

const nsp = io('/redux')

function fetchStore () {
  return new Promise((resolve, reject) => {
    var store
    var actions = []
    nsp.on('action', (action) => {
      debug(action)
      if (store) return store.dispatch(action)
      actions.push(action)
    })
    nsp.on('init', (events) => {
      debug(events)
      if (!store) store = createStore(reducer)
      events.forEach((event) => store.dispatch(event))
      resolve(store)
      actions.forEach((action) => store.dispatch(action))
    })
  })
}

function signUpUser (name, email, password) {
  return UserClientApi
    .createUser(name, email, password)
    .then((user) => user.startEmailVerification(email))
}

function startEmailVerification (email) {
  return UserClientApi
    .userFromEmail(email)
    .then(user => {
      if (!user) throw new Error('User not found')
      return user.startPasswordReset()
    })
}

function userForgotPassword (email) {
  return UserClientApi.userFromEmail(email).then((user) => {
    if (!user) throw new Error('User not found')
    return user.startPasswordReset()
  })
}

function userResetPassword (userId, token, newPassword) {
  return new UserClientApi(userId).resetPassword(token, newPassword)
}

function createLaundry (name) {
  return LaundryClientApi.createLaundry(name)
}

function createMachine (id, name, type) {
  return new LaundryClientApi(id).createMachine(name, type)
}
function deleteMachine (id) {
  return new MachineClientApi(id).deleteMachine()
}
function updateMachine (id, params) {
  return new MachineClientApi(id).updateMachine(params)
}
function createBooking (id, from, to) {
  return new MachineClientApi(id).createBooking(from, to)
}

function listBookingsInTime (laundryId, from, to) {
  return nsp.emit('listBookingsInTime', laundryId, from.getTime(), to.getTime())
}

function listBookingsForUser (laundryId, userId, filter = {}) {
  return nsp.emit('listBookingsForUser', laundryId, userId, filter)
}

function deleteBooking (id) {
  return new BookingClientApi(id).deleteBooking()
}

function inviteUserByEmail (laundryId, email) {
  return new LaundryClientApi(laundryId).inviteUserByEmail(email)
}

function deleteLaundry (laundryId) {
  return new LaundryClientApi(laundryId).deleteLaundry()
}

function deleteInvite (id) {
  return new InviteClientApi(id).deleteInvite()
}

function removeUserFromLaundry (laundryId, userId) {
  return new LaundryClientApi(laundryId).removeUserFromLaundry(userId)
}

class AppInitializer extends Initializer {
  setup (element) {
    const rootElement = element.querySelector('#AppRoot')
    if (!rootElement) return
    fetchStore().then((store) => {
      const actions = {
        userForgotPassword,
        signUpUser,
        createMachine,
        createLaundry,
        deleteMachine,
        updateMachine,
        userResetPassword,
        createBooking,
        deleteBooking,
        listBookingsInTime,
        listBookingsForUser,
        inviteUserByEmail,
        deleteLaundry,
        startEmailVerification,
        deleteInvite,
        removeUserFromLaundry
      }
      if (window.__FLASH_MESSAGES__) window.__FLASH_MESSAGES__.forEach((message) => store.dispatch(reduxActions.flash(message)))
      match({history: browserHistory, routes: routeGenerator(store)}, (e, redirectLocation, renderProps) => {
        ReactDOM.render(
          <ActionProvider actions={actions}>
            <IntlProvider locale='en'>
              <Provider store={store}>
                {React.createElement(Router, Object.assign({}, renderProps))}
              </Provider>
            </IntlProvider>
          </ActionProvider>, rootElement)
      })
    })
  }
}

module.exports = AppInitializer
