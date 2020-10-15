"use strict";
exports.__esModule = true;
exports.createPKCEHelper = void 0;
var abstract_pkce_1 = require("abstract-pkce");
var DEFAULT_ALGORITHM = 'SHA-256';
var BASE64_ENCODING = 'base64';
var HEX_ENCODING = 'hex';
var HMAC_ALGORITHM = 'HMAC';
var KEY_FORMAT = 'raw';
var KEY_USAGE_SIGN = 'sign';
var KEY_USAGE_VERIFY = 'verify';
function promisify(windowsPromise) {
    return new Promise(function (resolve, reject) { return Object.assign(windowsPromise, {
        oncomplete: resolve,
        onerror: function (errorEvent) { return reject(errorEvent.error); },
        onabort: reject
    }); });
}
var windowsCrypto = window.msCrypto;
var standardCrypto = window.crypto;
var crypto = standardCrypto
    || windowsCrypto;
var subtle = crypto.subtle || crypto.webkitSubtle;
var bufferToBase64 = function (buffer) { return window
    .btoa(String.fromCharCode.apply(String, Array.from(new Uint8Array(buffer)))); };
var bufferToHex = function (buffer) { return Array.prototype.map
    .call(new Uint8Array(buffer), function (byte) { return ("00" + byte.toString(16)).slice(-2); }).join(''); };
exports.createPKCEHelper = function (algorithm, encoding, isHMAC) {
    if (algorithm === void 0) { algorithm = DEFAULT_ALGORITHM; }
    if (encoding === void 0) { encoding = BASE64_ENCODING; }
    if (isHMAC === void 0) { isHMAC = true; }
    var convert = encoding === HEX_ENCODING ? bufferToHex : bufferToBase64;
    var encoder = new TextEncoder();
    return abstract_pkce_1.createPKCEHelper({
        getChallenge: isHMAC
            ? function (verifier) {
                var importKeyOperation = subtle
                    .importKey(KEY_FORMAT, encoder.encode(verifier), {
                    name: HMAC_ALGORITHM,
                    hash: { name: algorithm }
                }, false, [KEY_USAGE_SIGN, KEY_USAGE_VERIFY]);
                return ('then' in importKeyOperation ? importKeyOperation : promisify(importKeyOperation))
                    .then(function (key) {
                    var subtleSignOperation = subtle.sign(HMAC_ALGORITHM, key, new Uint8Array(0));
                    return 'then' in subtleSignOperation ? subtleSignOperation : promisify(subtleSignOperation);
                })
                    .then(convert);
            }
            : function (verifier) {
                var digestOperation = subtle.digest({ name: algorithm }, encoder.encode(verifier));
                var bufferPromise = 'then' in digestOperation
                    ? digestOperation
                    : promisify(digestOperation);
                return bufferPromise.then(convert);
            },
        buildVerifier: function (length, possibleCharsCount, getPossibleChar) { return crypto
            .getRandomValues(new Uint8Array(length))
            .reduce(function (previous, randomValue) { return "" + previous + getPossibleChar(randomValue % possibleCharsCount); }, ''); }
    });
};
