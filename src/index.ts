import { createPKCEHelper as originalCreatePKCEHelper, PKCEHelper } from 'abstract-pkce'

export type { PKCEHelper, PKCEChallenge } from 'abstract-pkce'

export type PKCEHelperWebCrypto = PKCEHelper<Promise<string>>

const DEFAULT_ALGORITHM = 'SHA-256'
const BASE64_ENCODING = 'base64'
const HEX_ENCODING = 'hex'
const HMAC_ALGORITHM = 'HMAC'
const KEY_FORMAT = 'raw'
const KEY_USAGE_SIGN = 'sign'
const KEY_USAGE_VERIFY = 'verify'

export type PKCEEncoding = 'hex' | 'base64'

interface WindowsPromise<T> {
  oncomplete?(payload: T): void,
  onerror?(errorEvent: ErrorEvent): void,
  onabort?(): void,
}

function promisify<T>(windowsPromise: WindowsPromise<T>): Promise<T> {
  return new Promise<T>((resolve: (value: T) => void, reject: (error: Error) => void) => Object.assign(windowsPromise, {
    oncomplete: resolve,
    onerror: (errorEvent) => reject(errorEvent.error),
    onabort: reject,
  } as WindowsPromise<T>))
}

const windowsCrypto: Crypto | undefined = ((window as unknown) as { msCrypto: Crypto }).msCrypto
const standardCrypto: Crypto | undefined = window.crypto
const crypto: Crypto = standardCrypto
  || windowsCrypto
const subtle: SubtleCrypto = crypto.subtle || ((crypto as unknown) as { webkitSubtle: SubtleCrypto }).webkitSubtle
const bufferToBase64: (buffer: ArrayBuffer) => string = (buffer) => window
  .btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))))
const bufferToHex: (buffer: ArrayBuffer) => string = (buffer: ArrayBuffer) => Array.prototype.map
  .call(new Uint8Array(buffer), (byte: number) => (`00${byte.toString(16)}`).slice(-2)).join('')

export const createPKCEHelper: (
  algorithm: string, encoding: PKCEEncoding, isHMAC?: boolean,
) => PKCEHelperWebCrypto = (
  algorithm = DEFAULT_ALGORITHM, encoding = BASE64_ENCODING, isHMAC = true,
) => {
  const convert = encoding === HEX_ENCODING ? bufferToHex : bufferToBase64
  const encoder = new TextEncoder()

  return originalCreatePKCEHelper<Promise<string>>({
    getChallenge: isHMAC
      ? (verifier: string) => {
        const importKeyOperation: Promise<CryptoKey> | WindowsPromise<CryptoKey> = subtle
          .importKey(KEY_FORMAT, encoder.encode(verifier), {
            name: HMAC_ALGORITHM,
            hash: { name: algorithm },
          }, false, [KEY_USAGE_SIGN, KEY_USAGE_VERIFY])

        return ('then' in importKeyOperation ? importKeyOperation : promisify<CryptoKey>(importKeyOperation))
          .then((key: CryptoKey): Promise<ArrayBuffer> => {
            const subtleSignOperation: Promise<ArrayBuffer> | WindowsPromise<ArrayBuffer> = subtle.sign(
              HMAC_ALGORITHM, key, new Uint8Array(0),
            )

            return 'then' in subtleSignOperation ? subtleSignOperation : promisify(subtleSignOperation)
          })
          .then(convert)
      }
      : (verifier: string) => {
        const digestOperation: Promise<ArrayBuffer> | WindowsPromise<ArrayBuffer> = subtle.digest(
          { name: algorithm }, encoder.encode(verifier),
        )
        const bufferPromise: Promise<ArrayBuffer> = 'then' in digestOperation
          ? digestOperation
          : promisify<ArrayBuffer>(digestOperation)

        return bufferPromise.then(convert)
      },
    buildVerifier: (
      length: number, possibleCharsCount: number, getPossibleChar: (position: number) => string,
    ): string => crypto
      .getRandomValues(new Uint8Array(length))
      .reduce(
        (previous, randomValue) => `${previous}${getPossibleChar(randomValue % possibleCharsCount)}`,
        '',
      ),
  })
}
