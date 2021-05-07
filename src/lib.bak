const sha256 = require('js-sha256');

const fs = require('fs');
const { composeAPI } = require('@iota/core')
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')

function hash(agnosticData, isBinaryInput) {
  const buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData
  const hash = sha256(buffer)
  return hash
}

async function publish(bundle, cb) {
   const iota = composeAPI({
       provider: bundle.provider
   })
   const trytes = asciiToTrytes(bundle.data);
   // Array of transfers which defines transfer recipients and value transferred in IOTAs.
   const transfers = [{
       address: bundle.address,
       value: 0, // 1Ki
       tag: bundle.tag ? bundle.tag.toUpperCase() : '',// optional tag of `0-27` trytes
       message: trytes // optional message in trytes
   }]

   let prepTrytes = null
   let ret = null
   try {
     prepTrytes = await iota.prepareTransfers(bundle.seed, transfers)
     ret = await iota.sendTrytes(prepTrytes, bundle.depth, bundle.minWeightMagnitude)
     return ret
  } catch (e) {
    throw `Could not establish a connection to the node ${e}`
  }
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
    return trytesToAscii(`${asciiArr.signatureMessageFragment}9`)
  } else {
    return null
  }
}
async function verify(bundle, isBinaryInput, docpath) {
  const calculatedHash = hash(docpath, isBinaryInput)
  let tangleHash = await fetch(bundle)
  tangleHash = tangleHash.replace(/\0/g, '')
  //tangleHash.replace(/\0/g, '') removes u0000
  return (calculatedHash.trim() === tangleHash.trim())
}


module.exports  = { hash, publish, fetch, verify }
