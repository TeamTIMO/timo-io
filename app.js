/**
 * @overview IO Microservice Server File
 * @module index
 * @author Dominik Sigmund
 * @version 0.9
 * @description Starts the Server and keeps it running
 * @memberof timo-io
 * @requires serialport
 */

// Require needed modules
console.log('Starting up TIMO-IO-service...')
console.log('Pulling in dependencies...')
var config = require('./config.json')

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var SerialPort = require("serialport")

var sp = new SerialPort(config.serialport, {
      baudRate: 9600
}, false)

// Read from Arduino
sp.on('open', function () {
  console.log('Serial Port Opened')
  sp.on('data', function (data) {
    var text = data.toString('utf8')
    console.log(text)
    var d = {}
    d.title = text.split(':')[0]
    d.body = text.split(':')[1]
    io.emit('io', d)
  })
})

// Write to Arduino
io.on('connection', function (socket) {
  console.log('a user connected')
  socket.on('io', function (data) {
    console.log(data)
    sp.open(function(err) {
      sp.write(data.title + ':' + data.body, function(err, res) {
                if (err) { console.error(err) }
                sp.close()
      })
    })
  })
})

// Open Server
http.listen(config.port, function(){
  console.log('listening on *:' + config.port)
})

/** Handles exitEvents by destroying open connections first
 * @function
* @param {object} options - Some Options
* @param {object} err - An Error Object
*/
function exitHandler (options, err) {
  console.log('Exiting...')
  sp.close(function () {
    process.exit()
  })
}
 // catches ctrl+c event
process.on('SIGINT', exitHandler)
 // catches uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error(err)
  exitHandler(null, err)
})

 // keep running
process.stdin.resume()
