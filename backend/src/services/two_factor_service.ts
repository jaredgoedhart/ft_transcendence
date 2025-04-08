/*
backend/src/services/two_factor_service.ts

This file provides services for two-factor authentication.
Contains functions for generating 2FA secrets, creating QR codes,
verifying 2FA tokens, and enabling/disabling 2FA for users.
Handles all the cryptographic operations for secure authentication.
Cryptography obscures communications so that unauthorized parties are unable to access them.
*/


import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import user_service from "./user_service";
import { User } from "../models/user";


/**
 * Generates a new 2FA secret for a user
 */
async function generate_2fa_secret(user_id: number): Promise<{ secret: string, qr_code_url: string } | null>
{
    try
    {
        /* GET THE USER */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
            return null;

        /* GENERATE NEW SECRET */
        const secret: speakeasy.GeneratedSecret = speakeasy.generateSecret({name: `FT_Transcendence:${user.username}`});

        /* STORE SECRET IN USER'S PROFILE */
        const update_data: { [key: string]: any } = { two_factor_secret: secret.base32, updated_at: new Date().toISOString() };

        const updated_user: User | null = await user_service.update_user(user_id, update_data);

        if (!updated_user)
            return null;

        /* GENERATE QR CODE FOR THE SECRET */
        const qr_code_url: string = await new Promise((resolve, reject) =>
        {
            qrcode.toDataURL(secret.otpauth_url || "", (error: Error | null | undefined, url: string) =>
            {
                if (error)
                {
                    reject(error);
                    return;
                }
                resolve(url);
            });
        });

        return { secret: secret.base32, qr_code_url: qr_code_url };
    }
    catch (error)
    {
        console.error("Error generating 2FA secret:", error);
        return null;
    }
}


/**
 * Verifies a 2FA token
 */
async function verify_2fa_token(user_id: number, token: string): Promise<boolean>
{
    try
    {
        /* GET THE USER */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user || !user.two_factor_secret)
            return false;

        /* VERIFY TOKEN -> window means that 1 time step before and after the current time is allowed */
        return speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: "base32",
            token: token,
            window: 1
        });
    }
    catch (error)
    {
        console.error("Error verifying 2FA token:", error);
        return false;
    }
}


/**
 * Enables 2FA for a user after verifying the setup
 */
async function enable_2fa(user_id: number, token: string): Promise<boolean>
{
    try
    {
        /* VERIFY TOKEN FIRST */
        const is_valid: boolean = await verify_2fa_token(user_id, token);

        if (!is_valid)
            return false;

        /* UPDATE USER TO ENABLE 2FA */
        const update_data: { [key: string]: any } = { two_factor_enabled: true, updated_at: new Date().toISOString() };

        const updated_user: User | null = await user_service.update_user(user_id, update_data);

        return !!updated_user;
    }
    catch (error)
    {
        console.error("Error enabling 2FA:", error);
        return false;
    }
}


/**
 * Disables 2FA for a user
 */
async function disable_2fa(user_id: number): Promise<boolean>
{
    try
    {
        /* UPDATE USER TO DISABLE 2FA */
        const update_data: { [key: string]: any } = { two_factor_enabled: false, two_factor_secret: null, updated_at: new Date().toISOString() };

        const updated_user: User | null = await user_service.update_user(user_id, update_data);

        return !!updated_user;
    }
    catch (error)
    {
        console.error("Error disabling 2FA:", error);
        return false;
    }
}


export default { generate_2fa_secret, verify_2fa_token, enable_2fa, disable_2fa };
