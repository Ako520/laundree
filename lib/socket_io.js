const socketIo = require('socket.io')
const redis = require('socket.io-redis')
const session = require('./session')
const config = require('config')
const {UserHandler, LaundryHandler, MachineHandler} = require('../handlers')
const {createInitialEvents, actions} = require('../redux')
const {events} = require('../utils')
const debug = require('debug')('laundree.lib.socket_io')
/**
 * Set up the socket with provided namespaces.
 * @param {Agent} server
 */
function setupSocket (server) {
  const io = socketIo(server)
  io.adapter(redis({host: config.get('redis.host'), port: config.get('redis.port')}))
  io.use((socket, next) => session(socket.request, socket.request.res, next))
  setupRedux(io.of('/redux'))
}

function setupRedux (io) {
  io.on('connect', (s) => {
    debug('Connecting socket')
    var currentUserId = s.request.session.passport ? s.request.session.passport.user : undefined
    UserHandler.findFromId(currentUserId).then((user) => {
      createInitialEvents(user).then((events) => s.emit('init', events))
      if (!user) return
      const removers = []
      removers.push(events.on(UserHandler, 'update', (user) => {
        debug('Emitting user update action')
        s.emit('action', actions.updateUser(user))
      }))
      removers.push(events.on(LaundryHandler, 'create', (laundry) => {
        debug('Emitting laundry create action')
        s.emit('action', actions.createLaundry(laundry))
      }))
      removers.push(events.on(LaundryHandler, 'update', (laundry) => {
        debug('Emitting laundry update action')
        s.emit('action', actions.updateLaundry(laundry))
      }))
      removers.push(events.on(MachineHandler, 'create', (machine) => {
        debug('Emitting machine create action')
        s.emit('action', actions.createMachine(machine))
      }))
      removers.push(events.on(MachineHandler, 'delete', (machine) => {
        debug('Emitting machine delete action')
        s.emit('action', actions.deleteMachine(machine))
      }))
      removers.push(events.on(MachineHandler, 'update', (machine) => {
        debug('Emitting machine update action')
        s.emit('action', actions.updateMachine(machine))
      }))
      s.on('disconnect', () => {
        debug('Disconnecting')
        removers.forEach((r) => r.remove())
      })
    })
  })
}

module.exports = setupSocket