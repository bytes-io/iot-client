const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const wifiService = require('./services/wifi')
const iptablesService = require('./services/iptables')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = process.env.PORT || 3000
let state = 'idle'

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// error handler
app.use(function (err, req, res, next) {
  function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  }
})

app.get('/bytes-networks', async (req, res) => {
  const networks = await wifiService.getNetworks();

  const bytesAps = networks.filter(n => /bytes-.+/g.test(n.ssid))
  console.log('Found Bytes networs: ', bytesAps)

  res.send(bytesAps)
})

app.get('/device-info', async (req, res) => {
  const interface = await wifiService.getInterfaceInfo();
  res.send(interface)
})

app.get('/buy', async (req, res) => {
  // const bytesAps = await wifiService.getNetworks();
  // const gatewayIp = await wifiService.connect(null, bytesAps[0].ssid, '12346789');
  // res.send({gatewayIp})

  state = 'buy'
  res.send({state})
})

app.get('/device-state', async (req,res) => {
  res.send({state})
})

app.get('/start-selling', async (req,res) => {
  iptablesService.allowForwarding((err) => {
    if (err) {
      throw new Error(err)
    }
  })
  state = 'sell'
  res.send({state})
})

app.get('/stop-selling', async (req,res) => {
  iptablesService.blockForwarding((err) => {
    if (err) {
      throw new Error(err)
    }
    res.sendStatus(200)
  })
  state = 'idle'
  // io.close(); // Todo:use disconnect

  res.send({state})
})

io.on('connection', function (client) {
  if (state === 'start-selling') {
    // send price parameter
    client.emit('message', "789");
  }
  console.log('client connected...', client.handshake.address)
  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
  })
  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
