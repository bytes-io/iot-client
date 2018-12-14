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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
