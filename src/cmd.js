#!/usr/bin/env node

const program = require('commander')
const { fetch, verify, publish, hash, fetchLegacy, verifyLegacy, publishLegacy } = require('./../dist/src/lib');

const config = require("./config.json");


program
  .command('hash <file>')
  .option('-b, --binary', 'Binary input rather than Path')
  .action(function (file, options) {
    const hashVal = hash(file, options.binary)
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
      const tag = options.tag ? options.tag : config.chrysalisOptions.tag
      const res = await publish(data, tag, provider)
      console.log('MessageId =', res)
    }

    else {
      //Perform operation on legacy-network
      const provider = options.provider ? options.provider : config.legacyOptions.provider
      const seed = options.seed ? options.seed : config.legacyOptions.seed
      const address = options.address ? options.address : config.legacyOptions.address
      const depth = options.depth ? Number(options.depth) : Number(config.legacyOptions.depth)
      const tag = options.tag ? options.tag : config.legacyOptions.tag
      const minWeightMagnitude = options.magnitude ? Number(options.magnitude) : Number(config.legacyOptions.minWeightMagnitude)
      try {
        const res = await publishLegacy({
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
        const res = await fetch(hash, provider)
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
        const message = await fetchLegacy({
          provider,
          address,
          hash
        })
        console.log('Tx-value =', message)
        return message
      }
      catch (e) {
        console.log(e)
      }
    }
  })

program
  .command('verify <docpath> <messageId>')
  .option('-l, --legacy [legacy]', `Option to only use if operation should be performed on the legacy network`)
  .option('-b, --binary', 'Binary input rather than Path')
  .option('-a, --address <address>', 'Address of the channel')
  .option('-p, --provider [provider]', `Provider, defaults: ${config.legacyOptions.provider}`)
  .option('-s, --seed [seed]', `Seed, defaults: ${config.legacyOptions.seed}`)
  .option('-m, --magnitude [magnitude]', `MinWeightMagnitude, defaults: ${config.legacyOptions.minWeightMagnitude}`)
  .option('-d, --depth [depth]', `Depth, defaults: ${config.legacyOptions.depth}`)
  .action(async function (docpath, messageId, options) {
    if (!options.legacy) {
      //Perform operation on Chrysalis-network
      try {
        const provider = options.provider ? options.provider : config.chrysalisOptions.provider
        const verified = await verify(messageId, options.binary, docpath, provider)
        console.log(verified)
      }
      catch (e) {
        console.log(e)
      }
    }
    else {
      const provider = options.provider ? options.provider : config.legacyOptions.provider
      const seed = options.seed ? options.seed : config.legacyOptions.seed
      const depth = options.depth ? Number(options.depth) : Number(config.legacyOptions.depth)
      const address = options.address ? options.address : config.legacyOptions.address
      const minWeightMagnitude = options.magnitude ? Number(options.magnitude) : Number(config.legacyOptions.minWeightMagnitude)
      try {
        const verified = await verifyLegacy({
          provider,
          seed,
          depth,
          address,
          hash: messageId, //In this case a legacy-transaction hash
          minWeightMagnitude
        }, options.binary, docpath)
        console.log(verified)
      } catch (e) {
        console.log(e)
      }
    }

  })


program.parse(process.argv)
