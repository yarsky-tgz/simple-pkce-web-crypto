import { createPKCEHelper as originalCreatePKCEHelper, PKCEHelper } from 'abstract-pkce'

export type { PKCEHelper, PKCEChallenge } from 'abstract-pkce'

export type PKCEHelperLegacyBrowser = PKCEHelper<Promise<string>>

const DEFAULT_ALGORITHM = 'SHA-256'
const DEFAULT_ENCODING = 'base64'

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
  .call(new Uint8Array(buffer), (x) => (`00${x.toString(16)}`).slice(-2)).join('')

export const createPKCEHelper: (
  algorithm: string, encoding: 'hex' | 'base64', isHMAC?: boolean,
) => PKCEHelperLegacyBrowser = (
  algorithm = DEFAULT_ALGORITHM, encoding = DEFAULT_ENCODING, isHMAC = true,
) => {
  const convert = encoding === 'hex' ? bufferToHex : bufferToBase64

  return originalCreatePKCEHelper<Promise<string>>({
    getChallenge: isHMAC
      ? (verifier: string) => {
        const encoder = new TextEncoder()
        const importKeyOperation: Promise<CryptoKey> | WindowsPromise<CryptoKey> = subtle
          .importKey('raw', encoder.encode(verifier), {
            name: 'HMAC',
            hash: { name: algorithm },
          }, false, ['sign', 'verify'])

        return ('then' in importKeyOperation ? importKeyOperation : promisify<CryptoKey>(importKeyOperation))
          .then((key: CryptoKey): Promise<ArrayBuffer> => {
            const subtleSignOperation: Promise<ArrayBuffer> | WindowsPromise<ArrayBuffer> = subtle.sign(
              'HMAC', key, new Uint8Array(0),
            )

            return 'then' in subtleSignOperation ? subtleSignOperation : promisify(subtleSignOperation)
          })
          .then(convert)
      }
      : (verifier: string) => {
        const digestOperation: Promise<ArrayBuffer> | WindowsPromise<ArrayBuffer> = subtle.digest(
          { name: algorithm }, new TextEncoder().encode(verifier),
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
