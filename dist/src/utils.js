"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
var js_sha256_1 = require("js-sha256");
var fs_1 = __importDefault(require("fs"));
var utils = /** @class */ (function () {
    function utils() {
    }
    /**
     * Is the given paramater a potential messageId
     * @param str The string to validate.
     */
    utils.isMessageId = function (str) {
        if (!new RegExp("^[0-9a-f]{" + str.length + "}$").test(str) || str.length != 64) {
            return false;
        }
        return true;
    };
    /**
     * Is the given paramater a potential messageId
     * @param str The string to validate.
     */
    utils.isSHA256 = function (str) {
        if (!new RegExp("^[A-Fa-f0-9]{" + str.length + "}$").test(str) || str.length != 64) {
            return false;
        }
        return true;
    };
    /**
     * Calculate Sha256-Hash of a given file
     * @param agnosticData Either directly a binary file or a filepath to the file that should be hashed
     * @param isBinaryInput Flag to check  the type provided in agnosticData-parm
     * @returns
     */
    utils.hash = function (agnosticData, isBinaryInput) {
        var buffer = !isBinaryInput ? fs_1.default.readFileSync(agnosticData) : agnosticData;
        var hash = js_sha256_1.sha256(buffer);
        return hash;
    };
    /**
     * Type Guard to assert that a given Payload is of type IIndexationPayload
     * @param payload the fetched payload to be checked
     * @returns true, if payload is of type IIndexationPayload
     */
    utils.isIndexationPayload = function (payload) {
        return payload.data !== undefined;
    };
    return utils;
}());
exports.utils = utils;
