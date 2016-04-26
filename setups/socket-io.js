var socketIo = require('socket.io')
var redis = require('socket.io-redis')
var config = require('../config')

function setUpSocketIo (server) {
  var io = socketIo(server)
  io.adapter(redis(config.redis))
  io.on('connection', (socket) => {
    socket.on('message', (data) => {
      io.sockets.emit('message', data)
    })
  })
}

module.exports = setUpSocketIo
