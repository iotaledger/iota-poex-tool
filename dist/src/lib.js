"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLegacy = exports.fetchLegacy = exports.publishLegacy = exports.hash = exports.verify = exports.fetch = exports.publish = void 0;
var utils_1 = require("./utils");
var client_1 = require("@iota/client");
var iota_js_1 = require("@iota/iota.js");
var core_1 = require("@iota/core");
var converter_1 = require("@iota/converter");
/**
 * Publish a proof-of-existence in a message on the Tangle
 * @param fileHash The hash of the file that will be used as the proof-of-existence
 * @param tag The value that will be used in the index-field
 * @param provider API-endpoint for Tangle operations
 * @param cb Optional callback-function
 * @returns messageId of the published message containing the proof-of-existence
 */
function publish(fileHash, tag, provider, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var client, msgSender, msg, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new client_1.ClientBuilder()
                        .node(provider)
                        .build();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    msgSender = client
                        .message()
                        .index(tag)
                        .accountIndex(0)
                        .data(new TextEncoder().encode(fileHash));
                    return [4 /*yield*/, msgSender.submit()];
                case 2:
                    msg = _a.sent();
                    if (cb) {
                        cb(msg);
                    }
                    else {
                        return [2 /*return*/, msg.messageId];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    throw "Could not establish a connection to the node " + e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.publish = publish;
/**
 * Fetch the payload-data of a message that in this context should contain the proof-of-existence-hash
 * @param messageId The messageId of the message to fetch
 * @param provider The endpoint to use
 * @returns string of actual payload data (e.g. the hash)
 */
function fetch(messageId, provider) {
    return __awaiter(this, void 0, void 0, function () {
        var client, message, dataInUtf8, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!utils_1.utils.isMessageId(messageId)) {
                        throw "Specified messageId " + messageId + " is not valid";
                    }
                    client = new client_1.ClientBuilder()
                        .node(provider)
                        .build();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.getMessage().data(messageId)];
                case 2:
                    message = _a.sent();
                    if (!message) {
                        throw "Message with specified messageId " + messageId + " could not be found";
                    }
                    if (message.message.payload && message.message.payload.type === "Indexation") {
                        dataInUtf8 = iota_js_1.Converter.bytesToUtf8(message.message.payload.data.data);
                        if (!utils_1.utils.isSHA256(dataInUtf8)) {
                            //Could also just return false here
                            throw "Payload-data of messageId " + messageId + " did not contain a SHA-256 Proof-of-Existence!";
                        }
                        return [2 /*return*/, dataInUtf8];
                    }
                    else {
                        throw "Message with specified messageId " + messageId + " does not contain a payload";
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    throw "Error fetching the the message for messageId " + messageId + " \n " + err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.fetch = fetch;
/**
 * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
 * @param messageId The identifier of the message containing the proof-of-existence
 * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
 * @param docpath Either binary file or file path of the file to verify
 * @param provider API-endpoint for Tangle operations
 * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
 */
function verify(messageId, isBinaryInput, docpath, provider) {
    return __awaiter(this, void 0, void 0, function () {
        var calculatedHash, tangleHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!utils_1.utils.isMessageId(messageId)) {
                        throw "Specified messageId " + messageId + " is not valid";
                    }
                    calculatedHash = utils_1.utils.hash(docpath, isBinaryInput);
                    return [4 /*yield*/, fetch(messageId, provider)];
                case 1:
                    tangleHash = _a.sent();
                    if (tangleHash == null) {
                        throw "Could not find provided messageId!";
                    }
                    tangleHash = tangleHash.replace(/\0/g, '');
                    //tangleHash.replace(/\0/g, '') removes u0000
                    return [2 /*return*/, (calculatedHash.trim() === tangleHash.trim())];
            }
        });
    });
}
exports.verify = verify;
/**
 * Calculate Sha256-Hash of a given file
 * @param agnosticData Either directly a binary file or a filepath to the file that should be hashed
 * @param isBinaryInput Flag to check  the type provided in agnosticData-parm
 * @returns
 */
function hash(agnosticData, isBinaryInput) {
    return utils_1.utils.hash(agnosticData, isBinaryInput);
}
exports.hash = hash;
/** From here onwards, the same operations for operations on the legacy-network are to be found  */
/**
     * Publish a proof-of-existence in a transaction on the Tangle
     * @param publishOptions Optional and required options for publishing, see documentation.
     * @param cb Optional callback function
     * @returns Array of transaction-elements containing the Proof of existence
     */
function publishLegacy(publishOptions, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var iota, trytes, transfers, prepTrytes, ret, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!publishOptions.provider || !publishOptions.address || !publishOptions.seed || !publishOptions.depth || !publishOptions.minWeightMagnitude)
                        throw "Did not provide all the parameters needed!";
                    iota = core_1.composeAPI({
                        provider: publishOptions.provider
                    });
                    trytes = converter_1.asciiToTrytes(publishOptions.data);
                    transfers = [{
                            address: publishOptions.address,
                            value: 0,
                            tag: publishOptions.tag.toUpperCase(),
                            message: trytes // optional message in trytes
                        }];
                    prepTrytes = null;
                    ret = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, iota.prepareTransfers(publishOptions.seed, transfers)];
                case 2:
                    prepTrytes = _a.sent();
                    return [4 /*yield*/, iota.sendTrytes(prepTrytes, publishOptions.depth, publishOptions.minWeightMagnitude)];
                case 3:
                    ret = _a.sent();
                    return [2 /*return*/, ret];
                case 4:
                    e_2 = _a.sent();
                    throw "Could not establish a connection to the node " + e_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.publishLegacy = publishLegacy;
/**
 * Fetch the signatureMessageFragment of the provided transaction, which in this context should contain the proof-of-existence-hash
 * @param fetchOptions Options for fetching data from the Tangle
 * @returns The payload of the specified transaction, potentially containing a Proof-of-existence hash
 */
function fetchLegacy(fetchOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var iota, address, response, err_2, asciiArr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iota = core_1.composeAPI({
                        provider: fetchOptions.provider
                    });
                    address = fetchOptions.address;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, iota.findTransactionObjects({ addresses: [address] })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    throw err_2;
                case 4:
                    //We need both address and transaction Hash(the latter to use it to filter the exact tx)
                    //@ts-ignore
                    if (response && typeof response !== "undefined" && response !== '' && response !== undefined) {
                        asciiArr = response.filter(function (res) { return res.hash === fetchOptions.hash; })[0];
                        if (!asciiArr || asciiArr === undefined) {
                            throw 'Returned an empty object';
                        }
                        return [2 /*return*/, converter_1.trytesToAscii(asciiArr.signatureMessageFragment + "9")];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.fetchLegacy = fetchLegacy;
/**
 * Verify that some document has not been tampered since its proof-of-existence has been published on the Tangle
 * @param fetchOptions Options for fetching data from the Tangle
 * @param isBinaryInput Flag value to determine whether docPath is a binary input or file path
 * @param docpath Either binary file or file path of the file to verify
 * @returns true if the document has not been tampered, e.g. the hash matches the provided proof-of-existence, else false
 */
function verifyLegacy(fetchOptions, isBinaryInput, docpath) {
    return __awaiter(this, void 0, void 0, function () {
        var calculatedHash, tangleHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    calculatedHash = utils_1.utils.hash(docpath, isBinaryInput);
                    return [4 /*yield*/, fetchLegacy(fetchOptions)];
                case 1:
                    tangleHash = _a.sent();
                    if (tangleHash == null) {
                        throw "Could not find provided tx-hash!";
                    }
                    tangleHash = tangleHash.replace(/\0/g, '');
                    //tangleHash.replace(/\0/g, '') removes u0000
                    return [2 /*return*/, (calculatedHash.trim() === tangleHash.trim())];
            }
        });
    });
}
exports.verifyLegacy = verifyLegacy;
