const { composeAPI } = require('@iota/core')
const { asciiToTrytes } = require('@iota/converter')
const fs = require('fs')

const {attachToTangle} = require('./proof-of-work')

const minWeightMagnitude = 14
const depth = 3
const iota = composeAPI({
  provider: 'https://nodes.thetangle.org:443',
  attachToTangle
})

let seed;
loadSeed();

exports.getCurrentAddress = function getCurrentAddress() {
  return iota.getNewAddress(seed)
}

exports.makeTx = async function makeTx(toAddress, amountInI, deviceInfo = {}) {
  const transfers = [{
    address: toAddress,
    value: amountInI,
    tag: asciiToTrytes(deviceInfo.macAddress || ''),
    message: asciiToTrytes(`Hi pie`)
  }]

  // bundle prep for all transfers
  console.log({seed})
  const trytes = await iota.prepareTransfers(seed, transfers)
  const bundle = await iota.sendTrytes(trytes, depth, minWeightMagnitude)
  console.log(`Published transaction with tail hash: ${bundle[0].hash}`)
  // console.log('Bundle:', bundle)
  console.log(`Explorer link https://thetangle.org/transaction/${bundle[0].hash}`, '\n')

  return bundle[0].hash
}

function loadSeed() {
  fs.readFile('./seed.txt', 'utf8', function(err, contents) {
    if (err) {
      console.log('Failed to load IOTA seed -', err.message);
      throw new Error(`Failed to load IOTA seed - ${err.message}`)
    }
    seed = contents.trim().toString()
    console.log('Loaded IOTA seed')
  });
}

setTimeout(() => {
  this.makeTx('IETGETEQSAAJUCCKDVBBGPUNQVUFNTHNMZYUCXXBFXYOOOQOHC9PTMP9RRIMIOQRDPATHPVQXBRXIKFDDRDPQDBWTY', 0)
}, 1000)


