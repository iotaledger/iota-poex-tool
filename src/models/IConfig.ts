export interface IConfiguration {

    chrysalisOptions: IChrysalisOptions,
    legacyOptions?: ILegacyOptions
}

interface IChrysalisOptions {
    provider: string
    tag: string
}

interface ILegacyOptions {
    /**
     * The seed from which to derive legacy-addresses
     */
    seed: string,

    /**
     * The address to use for the proof-transactions
     */
    address: string,

    /**
     * The api endpoint for the IOTA certificates.
     */
    provider: string,

    /**
     * Legacy-network-parameter
     */
    depth: number,

    /**
     * 9 for Devnet, 14 for Mainnet
     */
    minWeightMagnitude: number,
    
    /**
     * Optional tag for the proof
     */
    tag?: string
}

