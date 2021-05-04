#!/usr/bin/env node
const program = require('commander')
const lib = require('./lib.ts')
// import lib from './lib.ts';
// import lib = require("./lib");

// const { config.legacyOptions.seed, config.legacyOptions.address, config.legacyOptions.depth, config.legacyOptions.minWeightMagnitude, config.legacyOptions.provider, config.legacyOptions.tag } = require('./defaults')

const config = require("./../config.json");

program
  .command('hash <file>')
  .option('-b, --binary', 'Binary input rather than Path')
  .action(function (file, options) {
    const hashVal = lib.hash(file, options.binary)
    console.log(file, 'hash = ', hashVal)
  })

program
  .command('publish <data>')
  .option('-l, --legacy [legacy]', `Option to only use if operation should be performed on the legacy network`)
  .option('-p, --provider [provider]', `Provider, defaults: ${config.legacyOptions.provider}`)
  .option('-s, --seed [seed]', `Seed, defaults: ${config.legacyOptions.seed}`)
  .option('-a, --address [address]', `Provider, defaults: ${config.legacyOptions.address}`)
  .option('-m, --magnitude [magnitude]', `MinWeightMagnitude, defaults: ${config.legacyOptions.minWeightMagnitude}`)
  .option('-d, --depth [depth]', `Depth, defaults: ${config.legacyOptions.depth}`)
  .option('-t, --tag [depth]', `Tag, defaults: ${config.legacyOptions.tag}`)
  .action(async (data, options) => {

    if (!options.legacy) {
      //Perform operation on Chrysalis-network
      const provider = options.provider ? options.provider : config.chrysalisOptions.provider
      const res = lib.publishC2(data, provider)
      console.log('MessageId =', res)
    }

    else {
      //Perform operation on legacy-network
      const provider = options.provider ? options.provider : config.legacyOptions.provider
      const seed = options.seed ? options.seed : config.legacyOptions.seed
      const address = options.address ? options.address : config.legacyOptions.address
      const depth = options.depth ? options.depth : config.legacyOptions.depth
      const tag = options.tag ? options.tag : config.legacyOptions.tag
      const minWeightMagnitude = options.magnitude ? options.magnitude : config.legacyOptions.minWeightMagnitude
      try {
        const res = await lib.publishLegacy({
          provider,
          data,
          seed,
          tag,
          address,
          minWeightMagnitude,
          depth
        })

        console.log('tx Hash =', res[0].hash)

      } catch (e) {
        console.log(e)
      }
    }
  })


program
  .command('fetch <hash>')
  .option('-l, --legacy [legacy]', `Option to only use if operation should be performed on the legacy network`)
  .option('-a, --address <address>', 'Address of the channel')
  .option('-c, --convert', 'Convert to String after fetching')
  .option('-p, --provider [provider]', `Provider, defaults: ${config.legacyOptions.provider}`)
  .option('-s, --seed [seed]', `Seed, defaults: ${config.legacyOptions.seed}`)
  .option('-m, --magnitude [magnitude]', `MinWeightMagnitude, defaults: ${config.legacyOptions.minWeightMagnitude}`)
  .option('-d, --depth [depth]', `Depth, defaults: ${config.legacyOptions.depth}`)
  .action(async (hash, options) => {
    if (!options.legacy) {
      //Perform operation on Chrysalis-network
      try {
        const provider = options.provider ? options.provider : config.chrysalisOptions.provider
        const res = lib.fetchC2(data, provider)
        console.log('Payload-data =', res)
      }
      catch (e) {
        console.log(e)
      }
    }
    else {
      //Perform fetch operation on legacy network
      try {
        const address = options.address ? options.address : config.legacyOptions.address
        const provider = options.provider ? options.provider : config.legacyOptions.provider
        const message = await lib.fetchLegacy({
          provider,
          address,
          hash
        })
        console.log('tx value =', message)
        return message
      }
      catch (e) {
        console.log(e)
      }
    }
  })

program
  .command('verify <docpath>')
  .option('-b, --binary', 'Binary input rather than Path')
  .option('-a, --address <address>', 'Address of the channel')
  .option('-h, --hash <hash>', 'Transaction Hash of the channel')
  .option('-p, --provider [provider]', `Provider, defaults: ${config.legacyOptions.provider}`)
  .option('-s, --seed [seed]', `Seed, defaults: ${config.legacyOptions.seed}`)
  .option('-m, --magnitude [magnitude]', `MinWeightMagnitude, defaults: ${config.legacyOptions.minWeightMagnitude}`)
  .option('-d, --depth [depth]', `Depth, defaults: ${config.legacyOptions.depth}`)
  .action(async function (docpath, options) {
    const provider = options.provider ? options.provider : config.legacyOptions.provider
    const seed = options.seed ? options.seed : config.legacyOptions.seed
    const depth = options.depth ? options.depth : config.legacyOptions.depth
    const address = options.address ? options.address : config.legacyOptions.address
    const minWeightMagnitude = options.magnitude ? options.magnitude : config.legacyOptions.minWeightMagnitude
    try {
      const verified = await lib.verify({
        provider,
        seed,
        depth,
        address,
        hash: options.hash,
        minWeightMagnitude
      }, options.binary, docpath)
      console.log(verified)
    } catch (e) {
      console.log(e)
    }

  })


program.parse(process.argv)
