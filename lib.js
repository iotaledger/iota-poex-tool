const sha1 = require('js-sha1');
const fs = require('fs');
const { composeAPI } = require('@iota/core')
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')
const axios = require('axios');

function hash(agnosticData, isBinaryInput) {
  const buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData
  const hash = sha1(buffer)
  return hash
}

function publish(bundle, cb) {
   const iota = composeAPI({
       provider: bundle.provider
   })
   const trytes = asciiToTrytes(bundle.data);

   // Array of transfers which defines transfer recipients and value transferred in IOTAs.
   const transfers = [{
       address: bundle.address,
       value: 0, // 1Ki
       tag: 'BLUEPRINT9', // optional tag of `0-27` trytes
       message: trytes // optional message in trytes
   }]
   iota.prepareTransfers(bundle.seed, transfers)
   .then(trytes => iota.sendTrytes(trytes, bundle.depth, bundle.minWeightMagnitude))
   .then(ret => {
       cb(ret)
   })
   .catch(err => {
       // catch any errors
       throw 'there some error'+err
   })
}

async function fetch(bundle) {
  const iota = composeAPI({
    provider: bundle.provider
  })

  const address = bundle.address
  let response = null
  try {
     response = await iota.findTransactionObjects({ addresses: [address] })
  } catch(err) {
     throw err
  }

  /*
    We need both address and transaction Hash(the latter to use it to filter the exact tx)
  */
  if(response && response!==null && response!=='' && response!==undefined) {
    let asciiArr = response.filter(res => res.hash === bundle.hash)[0]
    if(!asciiArr || asciiArr===undefined) {
      throw 'Returned an empty object'
    }
    return trytesToAscii(asciiArr.signatureMessageFragment+'9')
  } else {
    return null
  }
}
async function verify(bundle, isBinaryInput, docpath) {
  console.log(bundle, isBinaryInput, docpath)
  const calculatedHash = hash(docpath, isBinaryInput)
  let tangleHash = null
  try {
    tangleHash = await fetch(bundle)
    tangleHash = tangleHash.replace(/\0/g, '')
    //tangleHash.replace(/\0/g, '') removes u0000
    const verified = (calculatedHash.trim() == tangleHash.trim())
    return verified
  } catch(e) {
    //return false
    throw e
  }
}


module.exports  = { hash, publish, fetch, verify }
