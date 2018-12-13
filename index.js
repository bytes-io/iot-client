const express = require('express')

const wifiService = require('./services/wifi')

const app = express()
const port = 3000

app.get('/bytes-networks', async (req, res) => {
  const bytesAps = await wifiService.getNetworks();
  res.send(bytesAps)
})

app.get('/buy', async (req, res) => {
  const bytesAps = await wifiService.getNetworks();
  const interface = await wifiService.connect(bytesAps[0]);
  res.send(interface)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
