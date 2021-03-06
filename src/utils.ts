import { sha256 } from 'js-sha256';
import fs from "fs";
import { IIndexationPayload, IMilestonePayload, ITransactionPayload } from '@iota/iota.js';

export class utils {

    /**
     * Is the given paramater a potential messageId
     * @param str The string to validate.
     */
    public static isMessageId(str: string): boolean {
        if (!new RegExp(`^[0-9a-f]{${str.length}}$`).test(str) || str.length != 64) {
            return false;
        }
        return true;
    }

    /**
     * Is the given paramater a potential messageId
     * @param str The string to validate.
     */
    public static isSHA256(str: string): boolean {
        if (!new RegExp(`^[A-Fa-f0-9]{${str.length}}$`).test(str) || str.length != 64) {
            return false;
        }
        return true;
    }

    /**
     * Calculate Sha256-Hash of a given file
     * @param agnosticData Either directly a binary file or a filepath to the file that should be hashed
     * @param isBinaryInput Flag to check  the type provided in agnosticData-parm
     * @returns 
     */
    public static hash(agnosticData: any, isBinaryInput: boolean): string {
        const buffer: Buffer = !isBinaryInput ? fs.readFileSync(agnosticData) : agnosticData
        const hash: string = sha256(buffer)
        return hash
    }

    /**
     * Type Guard to assert that a given Payload is of type IIndexationPayload
     * @param payload the fetched payload to be checked
     * @returns true, if payload is of type IIndexationPayload
     */
    public static isIndexationPayload(payload: IIndexationPayload | IMilestonePayload | ITransactionPayload): payload is IIndexationPayload {
        return (payload as IIndexationPayload).data !== undefined;
    }
}