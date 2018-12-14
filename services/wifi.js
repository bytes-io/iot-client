const WiFiControl = require('wifi-control')
const network = require('network')
const Bluebird = require('bluebird')

const scanForWiFi = Bluebird.promisify(WiFiControl.scanForWiFi)
const getActiveInterface = Bluebird.promisify(network.get_active_interface)

const options = {
  debug: true,
  connectionTimeout: 10000
}
WiFiControl.init(options)

exports.getNetworks = async function getNetworks(iface) {
  if(iface) {
    WiFiControl.configure(Object.assign(options, { iface }))
  }

  const response = await scanForWiFi()
  return response.networks
}

exports.connect = async function connect(iface, ssid, password) {
  if(iface) {
    WiFiControl.configure(Object.assign(options, { iface }))
  }

  const response = await connectToAP(ssid, password)
  console.log(response)

  //check if connected
  if(!response.success) {
    throw new Error(response.msg)
  }

  const interface = await this.getInterfaceInfo()
  console.log('Gatway IP ', interface.gateway_ip)

  return interface.gateway_ip
}

exports.getInterfaceInfo = function getInterfaceInfo() {
  return getInterfaceInfo()
}

const connectToAP = function (ssid, password) {
  console.log("connecting to: ", ssid)

  return new Promise(function(resolve, reject) {
    WiFiControl.connectToAP({ssid, password}, (err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    })
  })
}
