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
var bodyParser = require('body-parser')
var http = require('http').Server(app)
var io = require('socket.io')(http)

// Accept Text Body
app.use(bodyParser.text())

var SerialPort = require('serialport')

var sp = new SerialPort(config.serialport, {
  baudRate: 9600
}, false)

var arduinoState = {}

// Read from Arduino
sp.on('open', function () {
  console.log('[TIMO-IO]: Serial Port Opened')
  sp.write('io:ready', function (err, res) {
    if (err) { console.error('[TIMO-IO]: ' + err) }
  })
  sp.on('data', function (data) {
    var json = JSON.parse(data.toString())
    console.log('[TIMO-IO]: ARDUINO:  ' + JSON.stringify(json))
    arduinoState = json
    io.emit('io', json)
    if (json.shutdown >= 30) {
      setTimeout(function () {
        require('child_process').exec('sudo /sbin/shutdown -h now')
      }, 1000)
    }
  })
})
sp.on('close', function () {
  console.log('[TIMO-IO]: Serial Port Closed')
})

// Write to Arduino
io.on('connection', function (socket) {
  console.log('[TIMO-IO]: ' + 'a client connected: ' + socket.handshake.query.token)
  socket.emit('state', arduinoState)
  socket.on('disconnect', function () {
    console.log('[TIMO-IO]: ' + 'client disconnected: ' + socket.handshake.query.token)
  })
  socket.on('io', function (data) {
    console.log('[TIMO-IO]: ' + JSON.stringify(data))
    sp.write(JSON.stringify(data), function (err, res) {
      if (err) { console.error('[TIMO-IO]: ' + err) }
    })
  })
})

// Open Server
http.listen(config.port, function () {
  console.log('TIMO-IO-service listening on *:' + config.port)
})

// Routes
app.get('/state', function (req, res) {
  res.json(arduinoState)
})
app.put('/:title', function (req, res) {
  sp.write({ [req.params.title]: req.body }, function (err, res) {
    if (err) {
      console.error('[TIMO-IO]: ' + err)
      res.status(501).json(err)
    } else {
      res.status(200).end()
    }
  })
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
