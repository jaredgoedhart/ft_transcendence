/*
backend/src/types/modules.d.ts

This file provides custom TypeScript definitions for third-party modules `speakeasy` and `qrcode`.

- **"speakeasy"**: Defines interfaces and functions for generating secrets and verifying TOTP (Time-Based One-Time Passwords).
  - Includes `generateSecret` for creating authentication secrets.
  - Includes `totp.verify` for validating TOTP tokens.

- **"qrcode"**: Defines functions for generating QR codes.
  - Includes `toDataURL` for creating QR codes as data URLs, with or without custom options.

These definitions allow TypeScript to recognize and validate the usage of these modules in the project.
*/



declare module "speakeasy"
{
    export interface GeneratedSecret
    {
        ascii: string;
        hex: string;
        base32: string;
        otpauth_url?: string;
    }

    export function generateSecret(generation_options?:
    {
        length?: number;
        name?: string;
        issuer?: string;
    }): GeneratedSecret;

    export namespace totp
    {
        export function verify(verification_options:
       {
           secret: string;
           encoding?: string;
           token: string;
           window?: number;
       }): boolean;
    }
}


declare module "qrcode"
{
    export function toDataURL(qr_content: string, callback_function: (error: Error | null, data_url: string) => void): void;
    /* UNUSED: export function toDataURL(qr_content: string, qr_options: any, callback_function: (error: Error | null, data_url: string) => void): void; */
}
