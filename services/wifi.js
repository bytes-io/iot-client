const WiFiControl = require('wifi-control')
const network = require('network')
const Bluebird = require('bluebird')

const scanForWiFi = Bluebird.promisify(WiFiControl.scanForWiFi)
const connectToAP = Bluebird.promisify(WiFiControl.connectToAP)
const getActiveInterface = Bluebird.promisify(network.get_active_interface)

exports.getNetworks = async function getNetworks(iface) {
  const options = {
    debug: true,
    connectionTimeout: 10000
  }
  if(iface) {
    options.iface = iface
  }

  WiFiControl.init(options)
  const response = await scanForWiFi()

  const bytesAps = response.networks.filter(n => /bytes-.+/g.test(n.ssid))
  if(bytesAps.length < 1) {
    console.log('No Bytes aps found, exiting ..')
    return
  }

  console.log('Found Bytes networs: ', bytesAps)
  return bytesAps;
}

exports.connect = async function connect(ssid, password) {

  console.log("connecting to: ", ssid)
  const response = await connectToAP({ssid, password})
  //check if connected
  if(!response.success) {
    throw new Error(response.msg)
  }

  const interface = await getActiveInterface()
  console.log('Gatway IP ', interface.gateway_ip)
  
  return interface
}
