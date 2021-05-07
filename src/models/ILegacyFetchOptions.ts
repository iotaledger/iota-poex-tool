export interface ILegacyFetchOptions {
    /**
     * The api endpoint for the IOTA certificates.
     */
    provider: string,

    /**
     * The address to use for the proof-transactions
     */
    address: string,


    /**
     * The transaction(!)-hash
     */
    hash: string,

}