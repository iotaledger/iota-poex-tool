import { utils } from "./utils";

import { IConfiguration } from "./../models/IConfig";
import { ILegacyPublishOptions } from "./../models/ILegacyPublishOptions";
import { ILegacyFetchOptions } from "./../models/ILegacyFetchOptions";

import { composeAPI, Transaction, Transfer } from "@iota/core";
import { asciiToTrytes, trytesToAscii } from "@iota/converter";

export default class libLegacy {

    /**
     * Publish a proof-of-existence in a transaction on the Tangle
     * @param publishOptions Options for publishing, except the data field all values can also be provided via config.
     * @param cb Optional callback function
     * @returns Array of transaction-elements containing the Proof of existence
     */
    static async publishLegacy(publishOptions: ILegacyPublishOptions, cb?: Function) {

        //Get all parameters
        const config: IConfiguration = require("../options.config");
        if (!publishOptions.provider)
            publishOptions.provider = (config.legacyOptions?.provider) ? config.legacyOptions?.provider : "";

        if (!publishOptions.address)
            publishOptions.address = (config.legacyOptions?.address) ? config.legacyOptions?.address : "";

        if (!publishOptions.seed)
            publishOptions.seed = (config.legacyOptions?.seed) ? config.legacyOptions?.seed : "";

        if (!publishOptions.depth)
            publishOptions.depth = (config.legacyOptions?.depth) ? config.legacyOptions?.depth : -1;

        if (!publishOptions.minWeightMagnitude)
            publishOptions.minWeightMagnitude = (config.legacyOptions?.minWeightMagnitude) ? config.legacyOptions?.minWeightMagnitude : -1;

        if (publishOptions.provider === "" || publishOptions.address === "" || publishOptions.seed === "" || publishOptions.depth === -1 || publishOptions.minWeightMagnitude === -1)
            throw "Did not provide all the parameters needed either through parameters or config!";


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
     * Fetch the signatureMessageFragment of the provided transaction, which in this context should contain the proof-of-existence-hash 
     * @param fetchOptions Options for fetching data from the Tangle
     * @returns The payload of the specified transaction, potentially containing a Proof-of-existence hash
     */
    static async fetchLegacy(fetchOptions: ILegacyFetchOptions) {
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

    /**
     * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
     * @param fetchOptions Options for fetching data from the Tangle
     * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
     * @param docpath Either binary file or file path of the file to verify
     * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
     */
    static async verifyLegacy(fetchOptions: ILegacyFetchOptions, isBinaryInput: boolean, docpath: string) {
        const calculatedHash = utils.hash(docpath, isBinaryInput)
        let tangleHash;
        try {
            tangleHash = await libLegacy.fetchLegacy(fetchOptions)
        }
        catch (e) {
            console.log(e)
        }
        if (tangleHash == null) {
            throw "Could not find provided tx-hash!";
        }
        tangleHash = tangleHash.replace(/\0/g, '')
        //tangleHash.replace(/\0/g, '') removes u0000
        return (calculatedHash.trim() === tangleHash.trim())
    }
}