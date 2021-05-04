import { IConfiguration } from "./../models/IConfig";
import { utils } from "./utils";

import { ClientBuilder } from "@iota/client";
import { Converter } from '@iota/iota.js';

export default class lib {

    /**
     * Publish a proof-of-existence in a message on the Tangle
     * @param fileHash The hash of the file that will be used as the proof-of-existence 
     * @param provider API-endpoint for Tangle operations
     * @param cb Optional callback-function
     * @returns messageId of the published message containing the proof-of-existence
     */
    static async publishC2(fileHash: string, provider?: string, cb?: Function) {
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
     * @param provider The endpoint to use. If not set, use value from config-file
     * @returns string of actual payload data (e.g. the hash)
     */
    static async fetchC2(messageId: string, provider?: string): Promise<string> {

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
     * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
     * @param messageId The identifier of the message containing the proof-of-existence
     * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
     * @param docpath Either binary file or file path of the file to verify
     * @param provider API-endpoint for Tangle operations
     * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
     */
    static async verifyC2(messageId: string, isBinaryInput: boolean, docpath: string, provider?: string) {
        if (!provider) {
            const config: IConfiguration = require("../options.config");
            provider = config.chrysalisOptions.provider;
        }

        if (!utils.isMessageId(messageId)) {
            throw `Specified messageId ${messageId} is not valid`;
        }

        const calculatedHash = utils.hash(docpath, isBinaryInput)
        let tangleHash;
        try {
            tangleHash = await lib.fetchC2(messageId, provider);
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
// export = lib;