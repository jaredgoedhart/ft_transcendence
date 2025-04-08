/*
backend/src/controllers/two_factor_controller.ts

This file contains controller functions for two-factor authentication.
Handles generating 2FA setup data, enabling and disabling 2FA,
and verifying 2FA tokens during login.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import two_factor_service from "../services/two_factor_service";


/**
 * Generates 2FA secret and QR code for user setup
 */
async function generate_2fa_setup(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const result = await two_factor_service.generate_2fa_secret(user_id);

        if (!result)
        {
            reply.code(500).send({ error: "Failed to generate 2FA setup" });
            return;
        }

        reply.code(200).send({ message: "2FA setup generated successfully", data: result });
    }
    catch (error)
    {
        console.error("Error in generate_2fa_setup controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Verifies and enables 2FA for a user
 */
async function enable_2fa(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { token } = request.body as { token: string };

        if (!token)
        {
            reply.code(400).send({ error: "Token is required" });
            return;
        }

        const is_enabled: boolean = await two_factor_service.enable_2fa(user_id, token);

        if (!is_enabled)
        {
            reply.code(400).send({ error: "Invalid token or failed to enable 2FA" });
            return;
        }

        reply.code(200).send({ message: "2FA enabled successfully" });
    }
    catch (error)
    {
        console.error("Error in enable_2fa controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Disables 2FA for a user
 */
async function disable_2fa(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const is_disabled: boolean = await two_factor_service.disable_2fa(user_id);

        if (!is_disabled)
        {
            reply.code(500).send({ error: "Failed to disable 2FA" });
            return;
        }

        reply.code(200).send({ message: "2FA disabled successfully" });
    }
    catch (error)
    {
        console.error("Error in disable_2fa controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Verifies a 2FA token during login
 */
async function verify_2fa_token(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { user_id, token } = request.body as { user_id: number, token: string };

        if (!user_id || !token)
        {
            reply.code(400).send({ error: "User ID and token are required" });
            return;
        }

        const is_valid: boolean = await two_factor_service.verify_2fa_token(user_id, token);

        if (!is_valid)
        {
            reply.code(401).send({ error: "Invalid 2FA token" });
            return;
        }

        /* GENERATE JWT TOKEN - WILL BE IMPLEMENTED WITH JWT MODULE */
        const authentication_token: string = await reply.jwtSign({ id: user_id, two_factor_verified: true });

        reply.code(200).send({ message: "2FA verification successful", token: authentication_token });
    }
    catch (error)
    {
        console.error("Error in verify_2fa_token controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default { generate_2fa_setup, enable_2fa, disable_2fa, verify_2fa_token };
