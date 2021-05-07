//Not needed anymore
export interface IConfiguration {

    chrysalisOptions?: IChrysalisOptions,
    legacyOptions?: ILegacyOptions
}

interface IChrysalisOptions {
    provider: string
    tag: string
}

interface ILegacyOptions {
    /**
     * The api endpoint for the IOTA certificates.
     */
    provider: string,
}

