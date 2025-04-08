/*
backend/src/controllers/google_auth_controller.ts

This file contains controller functions for Google authentication.
Handles the verification of Google ID tokens, retrieval of Google user information,
and creates or updates user accounts based on Google authentication data.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import user_service from "../services/user_service";


interface GoogleUserInfo
{
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name?: string;
}


/**
 * Authenticate using Google ID token
 */
async function google_auth(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { id_token } = request.body as { id_token: string };

        if (!id_token)
        {
            reply.code(400).send({ error: "ID token is required" });
            return;
        }

        const google_user_info = await verify_google_token(id_token);

        if (!google_user_info)
        {
            reply.code(401).send({ error: "Invalid Google token" });
            return;
        }

        if (!google_user_info.email_verified)
        {
            reply.code(400).send({ error: "Email is not verified with Google" });
            return;
        }

        let user = await user_service.get_user_by_google_id(google_user_info.sub);

        if (!user)
        {
            user = await user_service.get_user_by_username_or_email(google_user_info.email);
        }

        if (user)
        {
            if (!user.google_id)
            {
                const update_data: { [key: string]: any } =
                {
                    google_id: google_user_info.sub,
                    updated_at: new Date().toISOString()
                };

                user = await user_service.update_user(user.id, update_data);
            }
        }
        else
        {
            const email_prefix = google_user_info.email.split('@')[0];

            const random_suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            const safe_username = email_prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
            const username = `g_${safe_username}_${random_suffix}`;

            const password = Math.random().toString(36).slice(-10);

            const base_name = google_user_info.name || email_prefix;

            const display_name = base_name.replace(/[^a-zA-Z0-9_-]/g, '_');

            user = await user_service.create_user({
                username: username,
                email: google_user_info.email,
                password: password,
                display_name: display_name,
                google_id: google_user_info.sub
            });
        }

        if (!user)
        {
            reply.code(500).send({ error: "Failed to create or retrieve user" });
            return;
        }


        const token: string = await reply.jwtSign({
            id: user.id,
            username: user.username,
            email: user.email
        });

        const { password_hash, ...user_without_password } = user;

        reply.code(200).send({ token, user: user_without_password });
    }
    catch (error)
    {
        console.error("Error in Google authentication:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Verifies a Google ID token and returns user info
 */
async function verify_google_token(id_token: string): Promise<GoogleUserInfo | null>
{
    try
    {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo',
        {
            params: { id_token }
        });

        const client_id = process.env.GOOGLE_CLIENT_ID;

        if (client_id && response.data.aud !== client_id)
        {
            console.error('Token is not intended for this application');
            return null;
        }

        return response.data as GoogleUserInfo;
    }
    catch (error)
    {
        console.error('Error verifying Google token:', error);
        return null;
    }
}

export default { google_auth };
