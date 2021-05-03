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
}