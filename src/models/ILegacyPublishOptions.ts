//No longer needed, as we no longer support publishing data on the legacy-network
export interface ILegacyPublishOptions {
    /**
     * The api endpoint for the IOTA certificates.
     */
    provider: string,

    /**
     * The serialized data (?)
     */
    data: string,

    /**
     * Optional tag for the proof
     */
    tag?: string,

    /**
     * The seed from which to derive legacy-addresses
     */
    seed: string,

    /**
     * The address to use for the proof-transactions
     */
    address: string,

    /**
     * 9 for Devnet, 14 for Mainnet
     */
    minWeightMagnitude: number,

    /**
     * Legacy-network-parameter
     */
    depth: number
}