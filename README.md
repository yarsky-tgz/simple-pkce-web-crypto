# simple-pkce-browser
PKCE HMAC or hash SHA256 base64 challenge &amp; verifier generator for any browser (using fast-sha256)

## Installation

```shell script
npm i simple-pkce-browser
```

## Usage

Library exports single function - `createPKCEHelper(isHMAC = true)`

This function returns object with two methods on it: 
 * `getChallenge(verifier: string) => string` - for getting challenge from verifier
 * `generateChallenge(verifierLength: number) => PKCEChallenge` - generates verifier of given length and returns `PKCEChallenge`:
 
```typescript
interface PKCEChallenge {
    verifier: string;
    challenge: string;
}
```

## Examples

if you need SHA256 base64 HMAC challenge:

```typescript
import { createPKCEHelper, PKCEChallenge, PKCEHelperLegacyBrowser } from 'simple-pkce-browser'

const VERIFIER_LENGTH = 64
const { generateChallenge, getChallenge }: PKCEHelperLegacyBrowser = createPKCEHelper()
const { verifier, challenge }: PKCEChallenge = generateChallenge(VERIFIER_LENGTH)
```

if you need SHA256 base64 hash you do exactly the same, but need to pass `false` as the first parameter to `createPKCEHelper()`:

```typescript
import { createPKCEHelper, PKCEChallenge, PKCEHelperLegacyBrowser } from 'simple-pkce-browser'

const VERIFIER_LENGTH = 64
const { generateChallenge, getChallenge }: PKCEHelperLegacyBrowser = createPKCEHelper(false)
const { verifier, challenge }: PKCEChallenge = generateChallenge(VERIFIER_LENGTH)
```
