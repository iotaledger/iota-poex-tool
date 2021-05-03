import { sha256 } from 'js-sha256';
import fs from "fs";
import { ClientBuilder } from "@iota/client";
import { Converter } from '@iota/iota.js';
import { utils } from "./utils";

import { IConfiguration } from "./../models/IConfig";
import { ILegacyPublishOptions } from "./../models/ILegacyPublishOptions";
import { ILegacyFetchOptions } from "./../models/ILegacyFetchOptions";

import { composeAPI, Transaction } from "@iota/core";
import { asciiToTrytes, trytesToAscii } from "@iota/converter";


//TODO: Most likely with C2, we should get rid of seed and addresses entirely

//TODO: Be consistent with optional parameters that might get imported through config-file


/**
 * 
 * @param agnosticData 
 * @param isBinaryInput 
 * @returns 
 */
function hash(agnosticData: any, isBinaryInput: boolean): string {
    const buffer: Buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData
    const hash: string = sha256(buffer)
    return hash
}

/**
 * 
 * @param options Options and data needed to publish a proof of existence
 * @param cb Optional callback-function
 * @returns 
 */
async function publishC2(data: string, provider?: string, cb?: Function) {
    if (!provider) {
        const config: IConfiguration = require("../options.config");
        provider = config.chrysalisOptions.provider;
    }

    const client = new ClientBuilder()
        .node(provider)
        .build();

    //might need something like this?
    // const serializedData: string =

    try {
        const msgSender = client
            .message()
            // .seed(options.seed)
            .accountIndex(0)
            .data(new TextEncoder().encode(data))

        // if (options.tag) {
        //     msgSender.index(options.tag)
        // }
        // if (options.seed) {
        //     msgSender.seed(options.seed)
        // }
        const msg = await msgSender.submit()

        if (cb) {
            cb(msg)
        }
        else {
            return msg;
        }
    }
    catch (e) {
        throw `Could not establish a connection to the node ${e}`
    }
}

async function publishLegacy(bundle: ILegacyPublishOptions, cb: Function) {
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

/**
 * fetch the data of a message from the Mainnet 
 * @param messageId The messageId of the message to fetch
 * @param provider The endpoint to use. If not set, use value from config-file
 * @returns string of actual payload data (e.g. the hash)
 */
async function fetchC2(messageId: string, provider?: string): Promise<string> {

    if (!provider) {
        const config: IConfiguration = require("../options.config");
        provider = config.chrysalisOptions.provider;
    }

    if (!utils.isMessageId(messageId)) {
        throw `Specified messageId ${messageId} is not valid`;
    }
    const client = new ClientBuilder()
        .node(provider)
        .build();

    try {
        const message = await client.getMessage().data(messageId);

        if (!message) {
            throw `Message with specified messageId ${messageId} could not be found`;
        }
        if (message.message.payload && message.message.payload.type === "Indexation") {
            //TODO: Do some form of check
            return Converter.bytesToUtf8(message.message.payload.data.data);
        }
        else {
            throw `Message with specified messageId ${messageId} does not contain a payload`;
        }
    } catch (err) {
        throw `Error fetching the the message for messageId ${messageId} \n ${err}`;
    }
}

async function fetchLegacy(bundle: ILegacyFetchOptions) {
    const iota = composeAPI({
        provider: bundle.provider
    })

    const address = bundle.address
    let response: Transaction[];
    try {
        // Promise<ReadonlyArray<Transaction>>;
        response = await iota.findTransactionObjects({ addresses: [address] })
    } catch (err) {
        throw err
    }

    /*
      We need both address and transaction Hash(the latter to use it to filter the exact tx)
    */
    //@ts-ignore
    if (response && typeof response !== "undefined" && response !== '' && response !== undefined) {
        let asciiArr = response.filter(res => res.hash === bundle.hash)[0]
        if (!asciiArr || asciiArr === undefined) {
            throw 'Returned an empty object'
        }
        return trytesToAscii(`${asciiArr.signatureMessageFragment}9`)
    } else {
        return null
    }
}