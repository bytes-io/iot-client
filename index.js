const express = require('express')


const wifiService = require('./services/wifi')
const iptablesService = require('./services/iptables')

const app = express()
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
  const bytesAps = await wifiService.getNetworks();
  res.send(bytesAps)
})

app.get('/buy', async (req, res) => {
  const bytesAps = await wifiService.getNetworks();
  const interface = await wifiService.connect(bytesAps[0]);
  res.send(interface)
})


app.get('/start-selling', async (req,res) => {
  iptablesService.allowForwarding((err) => {
    if (err) {
      res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

app.get('/stop-selling', async (req,res) => {
  iptablesService.blockForwarding((err) => {
    if (err) {
      res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
