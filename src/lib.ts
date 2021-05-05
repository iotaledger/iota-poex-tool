import { utils } from "./utils";

import { ClientBuilder } from "@iota/client";
import { Converter } from '@iota/iota.js';

import { ILegacyPublishOptions } from "./models/ILegacyPublishOptions";
import { ILegacyFetchOptions } from "./models/ILegacyFetchOptions";

import { composeAPI, Transaction, Transfer } from "@iota/core";
import { asciiToTrytes, trytesToAscii } from "@iota/converter";


/**
 * Publish a proof-of-existence in a message on the Tangle
 * @param fileHash The hash of the file that will be used as the proof-of-existence 
 * @param tag The value that will be used in the index-field
 * @param provider API-endpoint for Tangle operations
 * @param cb Optional callback-function
 * @returns messageId of the published message containing the proof-of-existence
 */
export async function publish(fileHash: string, tag: string, provider: string, cb?: Function) {

    const client = new ClientBuilder()
        .node(provider)
        .build();

    try {
        const msgSender = client
            .message()
            .index(tag)
            .accountIndex(0)
            .data(new TextEncoder().encode(fileHash))

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
 * Fetch the payload-data of a message that in this context should contain the proof-of-existence-hash 
 * @param messageId The messageId of the message to fetch
 * @param provider The endpoint to use
 * @returns string of actual payload data (e.g. the hash)
 */
export async function fetch(messageId: string, provider: string): Promise<string> {

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
            const dataInUtf8 = Converter.bytesToUtf8(message.message.payload.data.data);

            if (!utils.isSHA256(dataInUtf8)) {
                //Could also just return false here
                throw `Payload-data of messageId ${messageId} did not contain a SHA-256 Proof-of-Existence!`;
            }
            return dataInUtf8;
        }
        else {
            throw `Message with specified messageId ${messageId} does not contain a payload`;
        }
    } catch (err) {
        throw `Error fetching the the message for messageId ${messageId} \n ${err}`;
    }
}

/**
 * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
 * @param messageId The identifier of the message containing the proof-of-existence
 * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
 * @param docpath Either binary file or file path of the file to verify
 * @param provider API-endpoint for Tangle operations
 * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
 */
export async function verify(messageId: string, isBinaryInput: boolean, docpath: string, provider: string) {
    if (!utils.isMessageId(messageId)) {
        throw `Specified messageId ${messageId} is not valid`;
    }

    const calculatedHash = utils.hash(docpath, isBinaryInput)
    let tangleHash = await fetch(messageId, provider);

    if (tangleHash == null) {
        throw "Could not find provided messageId!";
    }
    tangleHash = tangleHash.replace(/\0/g, '')
    //tangleHash.replace(/\0/g, '') removes u0000
    return (calculatedHash.trim() === tangleHash.trim())
}


/**
 * Calculate Sha256-Hash of a given file
 * @param agnosticData Either directly a binary file or a filepath to the file that should be hashed
 * @param isBinaryInput Flag to check  the type provided in agnosticData-parm
 * @returns 
 */
export function hash(agnosticData: any, isBinaryInput: boolean): string {
    return utils.hash(agnosticData, isBinaryInput);
}






/** From here onwards, the same operations for operations on the legacy-network are to be found  */





/**
     * Publish a proof-of-existence in a transaction on the Tangle
     * @param publishOptions Optional and required options for publishing, see documentation.
     * @param cb Optional callback function
     * @returns Array of transaction-elements containing the Proof of existence
     */
export async function publishLegacy(publishOptions: ILegacyPublishOptions, cb?: Function) {
    if (!publishOptions.provider || !publishOptions.address || !publishOptions.seed || !publishOptions.depth || !publishOptions.minWeightMagnitude)
        throw "Did not provide all the parameters needed!";


    const iota = composeAPI({
        provider: publishOptions.provider
    })
    const trytes = asciiToTrytes(publishOptions.data);

    // Array of transfers which defines transfer recipients and value transferred in IOTAs.
    const transfers: Transfer[] = [{
        address: publishOptions.address,
        value: 0, // 1Ki
        tag: publishOptions.tag.toUpperCase(), // optional tag of `0-27` trytes
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
 * Fetch the signatureMessageFragment of the provided transaction, which in this context should contain the proof-of-existence-hash 
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
        response = await iota.findTransactionObjects({ addresses: [address] })
    } catch (err) {
        throw err
    }


    //We need both address and transaction Hash(the latter to use it to filter the exact tx)

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

/**
 * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
 * @param fetchOptions Options for fetching data from the Tangle
 * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
 * @param docpath Either binary file or file path of the file to verify
 * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
 */
export async function verifyLegacy(fetchOptions: ILegacyFetchOptions, isBinaryInput: boolean, docpath: string) {
    const calculatedHash = utils.hash(docpath, isBinaryInput)

    let tangleHash = await fetchLegacy(fetchOptions)
    if (tangleHash == null) {
        throw "Could not find provided tx-hash!";
    }
    tangleHash = tangleHash.replace(/\0/g, '')
    //tangleHash.replace(/\0/g, '') removes u0000
    return (calculatedHash.trim() === tangleHash.trim())
}
