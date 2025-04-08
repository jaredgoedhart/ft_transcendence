/*
backend/src/controllers/authentication_controller.ts

This file contains controller functions for user authentication.
Handles user registration, login, and two-factor authentication processes.
Validates user credentials and manages authentication responses.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import user_service from "../services/user_service";
import { User } from "../models/user";


/**
 * Handles user registration
 */
async function register(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { username, email, password, display_name } = request.body as { username: string, email: string, password: string, display_name: string };

        if (!username || !email || !password || !display_name)
        {
            reply.code(400).send({ error: "Missing required fields; username, email, password or display name" });
            return;
        }

        if (password.includes(' ') || password.includes('\t'))
        {
            reply.code(400).send({ error: "Password cannot contain spaces or tabs" });
            return;
        }

        /* CHECK IF USERNAME OR EMAIL ALREADY EXISTS */
        const existing_user: User | null = await user_service.get_user_by_username_or_email(username) || await user_service.get_user_by_username_or_email(email);

        if (existing_user)
        {
            reply.code(409).send({ error: "Username or email already in use" });
            return;
        }

        /* CHECK IF DISPLAY NAME IS ALREADY TAKEN */
        const display_name_taken = await user_service.is_display_name_taken(display_name, 0);

        if (display_name_taken)
        {
            reply.code(409).send({ error: "Display name is already taken" });
            return;
        }

        const new_user: User | null = await user_service.create_user({ username, email, password, display_name });

        if (!new_user)
        {
            reply.code(500).send({ error: "Failed to create user" });
            return;
        }

        /* DON'T SEND PASSWORD HASH IN RESPONSE SO new_user IS CREATED OUT OF user, BUT WITHOUT password_hash */
        const { password_hash, ...user_without_password } = new_user;

        reply.code(201).send({ message: "User registered successfully", user: user_without_password});
    }
    catch (error: any)
    {
        console.error("Error in register controller:", error);

        if (error.message === "Display name is already taken")
        {
            reply.code(409).send({ error: "Display name is already taken" });
            return;
        }

        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Handles login for users with 2FA enabled
 */
async function two_factor_login(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        reply.code(200).send({ message: "2FA required", user_id: user.id, requires_2fa: true });
    }
    catch (error)
    {
        console.error("Error in two_factor_login controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Handles user login
 */
async function login(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { identifier, password } = request.body as { identifier: string, password: string };

        if (!identifier || !password)
        {
            reply.code(400).send({ error: "Missing username/email or password" });
            return;
        }

        if (password.includes(' ') || password.includes('\t'))
        {
            reply.code(400).send({ error: "Password cannot contain spaces or tabs" });
            return;
        }

        const user: User | null = await user_service.validate_user_credentials(identifier, password);

        if (!user)
        {
            reply.code(401).send({ error: "Invalid credentials" });
            return;
        }

        if (user.two_factor_enabled)
        {
            reply.code(200).send({ message: "2FA required", user_id: user.id, requires_2fa: true });
            return;
        }

        const token: string = await reply.jwtSign({ id: user.id, username: user.username, email: user.email });

        const { password_hash, ...user_without_password } = user;

        reply.code(200).send({ token, user: user_without_password });
    }
    catch (error)
    {
        console.error("Error in login controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default
{
    register,
    login,
    two_factor_login
};
