/**
 * Created by budde on 28/05/16.
 */

const Initializer = require('./initializer')

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
const {UserClientApi, LaundryClientApi, MachineClientApi, BookingClientApi} = require('../api')

const nsp = io('/redux')

function fetchStore () {
  return new Promise((resolve, reject) => {
    var store
    var actions = []
    nsp.on('action', (action) => {
      console.log(action)
      if (store) return store.dispatch(action)
      actions.push(action)
    })
    nsp.on('init', (events) => {
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

function listBookings (laundryId, from, to) {
  return nsp.emit('listBookings', laundryId, from.getTime(), to.getTime())
}

function deleteBooking (id) {
  return new BookingClientApi(id).deleteBooking()
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
        listBookings
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
