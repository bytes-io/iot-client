const express = require('express')
const socketIo = require('socket.io')
const http = require('http')
const cors = require('cors')
const ioClient = require('socket.io-client');

const wifiService = require('./services/wifi')
const iptablesService = require('./services/iptables')
const iotaService = require('./services/iota')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

let state = 'idle'
let paymentInfo = {
  toAddress: null,
  price: null
}
let askPrice = 3
let bidPrice = 3

app.use(cors())

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

  const ifaces = await wifiService.getAllInterfaces()
  const iface = ifaces.find(i => i.name === 'wlan1')
  createSocketClient(iface.gateway_ip)
  socketClient.emit('get-payment-info')

  state = 'buy'
  console.log('Ready to buy access')
  res.send({state})
})

app.get('/device-state', async (req,res) => {
  res.send({state})
})

app.get('/set-price/:price', async (req,res) => {
  askPrice = req.params.price
  console.log("Set ask price to", askPrice)
  res.sendStatus(200)
})

app.get('/start-selling', async (req,res) => {
  console.log('Device is in selling mode')
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
  paymentInfo = {
    toAddress: null,
    price: null
  }

  res.send({state})
})

app.get('/wallet/data', async (req,res) => {
  const accountData = await iotaService.getAccountData()
  res.send({accountData})
})

let payIntervalId = null;
let socketClient = null
function createSocketClient(ip) {
  console.log('Connecting to websocket', ip)
  socketClient = ioClient(`http://${ip}:3000`);

  socketClient.on('payment-info', function (data) {
    console.log('payment-info RECEIVED')
    if (state !== 'buy') {
      console.log('Ignoring payment info data, Invalid state', state)
      return
    }
    console.log('Received payment info', data)
    paymentInfo.toAddress = data.toAddress
    paymentInfo.price = data.price

    payIntervalId = setInterval(async function() {
      console.log('Initializing payment');
      await iotaService.makeTx(paymentInfo.toAddress, 0)
    }, 1 * 10 * 1000);
  })

  socketClient.on('disconnect', function () {
    console.log('ws client disconnected')

    payIntervalId && clearInterval(payIntervalId);
    payIntervalId = null
    socketClient = null
  })
  
  socketClient.on('error', function (err) {
    console.log('Socket connection error:', err)

    payIntervalId && clearInterval(payIntervalId);
    payIntervalId = null
    socketClient = null
  })

  return socketClient
}

io.on('connection', function (client) {
  console.log('client connected...', client.handshake.address)

  client.on('get-payment-info', async function (data) {
    console.log('get-payment-info RECEIVED')
    const address = await iotaService.getCurrentAddress()
    client.emit('payment-info', {
      toAddress: address,
      price: askPrice
    });
  })

  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
  })
  
  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Example app listening on port ${port}!`))
