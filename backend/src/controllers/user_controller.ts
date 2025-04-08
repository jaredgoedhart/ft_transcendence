/*
backend/src/controllers/user_controller.ts

This file contains controller functions for user profile management.
Handles retrieving user profiles and updating user profile information
while ensuring unique display names and emails.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import user_service from "../services/user_service";
import { User } from "../models/user";


/**
 * Gets the authenticated user's profile
 */
async function get_user_profile(request: FastifyRequest, reply: FastifyReply): Promise<void>
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

        const { password_hash, ...user_without_password } = user;

        reply.code(200).send({ user: user_without_password });
    }
    catch (error)
    {
        console.error("Error getting profile:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Updates user profile information
 */
async function update_user_profile(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const { display_name, email } = request.body as { display_name?: string, email?: string };

        if (!display_name && !email)
        {
            reply.code(400).send({ error: "No update data provided" });
            return;
        }

        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        /* CHECK IF DISPLAY NAME IS UNIQUE WHEN UPDATING */
        if (display_name && display_name !== user.display_name)
        {
            const is_display_name_taken = await user_service.is_display_name_taken(display_name, user_id);
            if (is_display_name_taken)
            {
                reply.code(409).send({ error: "Display name is already taken" });
                return;
            }
        }

        /* CREATE UPDATE USER DATA OBJECT */
        const update_user_data: { [key: string]: any } = {};

        if (display_name)
            update_user_data.display_name = display_name;
        if (email)
            update_user_data.email = email;

        update_user_data.updated_at = new Date().toISOString();

        const updated_user: User | null = await user_service.update_user(user_id, update_user_data);

        if (!updated_user)
        {
            reply.code(500).send({ error: "Failed to update profile. Display Name and Email must be unique." });
            return;
        }

        const { password_hash, ...user_without_password } = updated_user;

        reply.code(200).send({ message: "Profile updated successfully", user: user_without_password });
    }
    catch (error: any)
    {
        console.error("Error updating profile:", error);

        if (error.message === "Display name is already taken")
        {
            reply.code(409).send({ error: "Display name is already taken" });
            return;
        }

        reply.code(500).send({ error: "Internal server error" });
    }
}


export default { get_profile: get_user_profile, update_profile: update_user_profile };
