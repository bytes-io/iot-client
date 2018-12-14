const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const wifiService = require('./services/wifi')
const iptablesService = require('./services/iptables')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = 3000

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
  let networks;
  try {
    networks = await wifiService.getNetworks();
  } catch (err) {
    throw new Error(err)
  }

  const bytesAps = networks.filter(n => /bytes-.+/g.test(n.ssid))
  console.log('Found Bytes networs: ', bytesAps)

  res.send(bytesAps)
})

app.get('/buy', async (req, res) => {
  // const bytesAps = await wifiService.getNetworks();
  // const interface = await wifiService.connect(null, bytesAps[0].ssid, '12346789');
  // res.send(interface)


})


app.get('/give-access', async (req,res) => {
  iptablesService.allowForwarding((err) => {
    if (err) {
      res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

app.get('/deny-access', async (req,res) => {
  iptablesService.blockForwarding((err) => {
    if (err) {
      res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

app.get('/start-selling', async (req,res) => {
  io.on('connection', function (client) {
    console.log('client connected...', client.handshake.address)
    client.on('disconnect', function () {
      console.log('client disconnect...', client.id)
    })
    // send price parameter
    client.emit('message', "789");
    client.on('error', function (err) {
      console.log('received error from client:', client.id)
      console.log(err)
    })
  })
})

app.get('/stop-selling', async (req,res) => {
  io.close();
})


server.listen(port, () => console.log(`Example app listening on port ${port}!`))
