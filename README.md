# simple-pkce-web-crypto
PKCE helper, generates verify & challenge with preconfigured type (HMAC or hash) algorithm and digest encoding using Web Crypto API

## Installation

```shell script
npm i simple-pkce-web-crypto
```

## Usage

Library exports single function - `createPKCEHelper(algorithm = 'SHA-256', encoding = 'base64', isHMAC = true)`

This function returns object with two async methods on it: 
 * `getChallenge(verifier: string) => Promise<string>` - for getting challenge from verifier
 * `generateChallenge(verifierLength: number) => Promise<PKCEChallenge>` - generates verifier of given length and returns `Promise<PKCEChallenge>`:
 
```typescript
interface PKCEChallenge {
    verifier: string;
    challenge: string;
}
```

## Examples

if you need SHA256 base64 HMAC challenge:

```typescript
import { createPKCEHelper, PKCEChallenge, PKCEHelperWebCrypto } from 'simple-pkce-web-crypto'

(async () => {
  const VERIFIER_LENGTH = 64
  const { generateChallenge }: PKCEHelperWebCrypto = createPKCEHelper()
  const { verifier, challenge }: PKCEChallenge = await generateChallenge(VERIFIER_LENGTH)
})()
```

You can use any other algorithm:

```typescript
import { createPKCEHelper, PKCEChallenge, PKCEHelperWebCrypto } from 'simple-pkce-web-crypto'

(async () => {
  const VERIFIER_LENGTH = 80
  const { generateChallenge }: PKCEHelperWebCrypto = createPKCEHelper('SHA-512')
  const { verifier, challenge }: PKCEChallenge = await generateChallenge(VERIFIER_LENGTH)
})()
```

```typescript
import { createPKCEHelper, PKCEChallenge, PKCEHelperLegacyBrowser } from 'simple-pkce-web-crypto'

(async () => {
  const VERIFIER_LENGTH = 80
  const { generateChallenge }: PKCEHelperLegacyBrowser = createPKCEHelper('SHA-224', 'hex', false)
  const { verifier, challenge }: PKCEChallenge = await generateChallenge(VERIFIER_LENGTH)
})()
```
