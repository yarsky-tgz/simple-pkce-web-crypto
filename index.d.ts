import { PKCEHelper } from 'abstract-pkce';
export type { PKCEHelper, PKCEChallenge } from 'abstract-pkce';
export declare type PKCEHelperWebCrypto = PKCEHelper<Promise<string>>;
export declare type PKCEEncoding = 'hex' | 'base64';
export declare const createPKCEHelper: (algorithm: string, encoding: PKCEEncoding, isHMAC?: boolean) => PKCEHelperWebCrypto;
