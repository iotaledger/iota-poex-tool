import { sha256 } from 'js-sha256';
import fs from "fs";
import { utils } from "./utils";

import { IConfiguration } from "./../models/IConfig";
import { ILegacyPublishOptions } from "./../models/ILegacyPublishOptions";
import { ILegacyFetchOptions } from "./../models/ILegacyFetchOptions";

import { composeAPI, Transaction, Transfer } from "@iota/core";
import { asciiToTrytes, trytesToAscii } from "@iota/converter";

import { ClientBuilder } from "@iota/client";
import { Converter } from '@iota/iota.js';


/**
 * 
 * @param agnosticData Either directly a binary file or a filepath to the file that should be hashed
 * @param isBinaryInput Flag to check  the type provided in agnosticData-parm
 * @returns 
 */
export function hash(agnosticData: any, isBinaryInput: boolean): string {
    const buffer: Buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData
    const hash: string = sha256(buffer)
    return hash
}

/**
 * 
 * @param options Options and data needed to publish a proof of existence
 * @param cb Optional callback-function
 * @returns messageId of the message
 */
export async function publishC2(data: string, provider?: string, cb?: Function) {
    const config: IConfiguration = require("../options.config");
    if (!provider) {
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

        const msg = await msgSender.submit()

        if (cb) {
            cb(msg)
        }
        else {
            return msg.messageId;
        }
    }
    catch (e) {
        throw `Could not establish a connection to the node ${e}`
    }
}

/**
 * 
 * @param publishOptions Options for publishing, except the data field all values can also be provided via config.
 * @param cb Optional callback function
 * @returns Transaction array of of Tangle-Proof of existence
 */
export async function publishLegacy(publishOptions: ILegacyPublishOptions, cb?: Function) {

    //Get all parameters
    const config: IConfiguration = require("../options.config");
    if (!publishOptions.provider) {
        publishOptions.provider = (config.legacyOptions?.provider) ? config.legacyOptions?.provider : "";
    }

    if (!publishOptions.address) {
        publishOptions.address = (config.legacyOptions?.address) ? config.legacyOptions?.address : "";
    }

    if (!publishOptions.seed) {
        publishOptions.seed = (config.legacyOptions?.seed) ? config.legacyOptions?.seed : "";
    }

    if (!publishOptions.depth) {
        publishOptions.depth = (config.legacyOptions?.depth) ? config.legacyOptions?.depth : -1;
    }

    if (!publishOptions.minWeightMagnitude) {
        publishOptions.minWeightMagnitude = (config.legacyOptions?.minWeightMagnitude) ? config.legacyOptions?.minWeightMagnitude : -1;
    }

    if(publishOptions.provider === "" || publishOptions.address === "" || publishOptions.seed === "" || publishOptions.depth === -1 || publishOptions.minWeightMagnitude === -1){
        throw "Did not provide all the parameters needed either through parameters or config!";
    }

    const iota = composeAPI({
        provider: publishOptions.provider
    })
    const trytes = asciiToTrytes(publishOptions.data);

    // Array of transfers which defines transfer recipients and value transferred in IOTAs.
    const transfers: Transfer[] = [{
        address: publishOptions.address,
        value: 0, // 1Ki
        tag: publishOptions.tag ? publishOptions.tag.toUpperCase() : '',// optional tag of `0-27` trytes
        message: trytes // optional message in trytes
    }]

    let prepTrytes = null
    let ret = null
    try {
        prepTrytes = await iota.prepareTransfers(publishOptions.seed, transfers)
        ret = await iota.sendTrytes(prepTrytes, publishOptions.depth, publishOptions.minWeightMagnitude)
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
export async function fetchC2(messageId: string, provider?: string): Promise<string> {

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

/**
 * 
 * @param fetchOptions Options for fetching data from the Tangle
 * @returns The payload of the specified transaction, potentially containing a Proof-of-existence hash
 */
export async function fetchLegacy(fetchOptions: ILegacyFetchOptions) {
    const iota = composeAPI({
        provider: fetchOptions.provider
    })

    const address = fetchOptions.address
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
        let asciiArr = response.filter(res => res.hash === fetchOptions.hash)[0]
        if (!asciiArr || asciiArr === undefined) {
            throw 'Returned an empty object'
        }
        return trytesToAscii(`${asciiArr.signatureMessageFragment}9`)
    } else {
        return null
    }
}