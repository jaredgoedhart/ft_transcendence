/*
backend/src/controllers/gdpr_controller.ts

This file contains controller functions related to GDPR compliance (data privacy rules).
Handles retrieving personal data for user export, anonymizing user accounts,
and completely deleting user accounts with all associated data.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import user_service from "../services/user_service";
import file_service from "../services/file_service";
import { User } from "../models/user";


/**
 * Retrieves all personal data for the current user (data portability)
 */
async function get_user_data(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        /* GET USER DATA */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        /* GET ADDITIONAL USER DATA */
        const user_matches = await user_service.get_user_matches(user_id);
        const user_friends = await user_service.get_user_friends(user_id);

        /* COMPILE COMPLETE USER DATA PACKAGE */
        const user_data =
        {
            profile:
            {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                created_at: user.created_at,
                updated_at: user.updated_at
            },
            matches: user_matches,
            friends: user_friends
        };

        reply.code(200).send({ user_data });
    }
    catch (error)
    {
        console.error("Error fetching user data:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Anonymizes user account data while keeping match history
 */
async function anonymize_user(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        /* GET USER DATA */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        /* GENERATE ANONYMOUS USERNAME */
        const anonymous_username: string = `anonymous_${Math.floor(Math.random() * 1000000)}`;
        const anonymous_email: string = `${anonymous_username}@anonymized.local`;
        const anonymous_display_name: string = "Anonymized User";

        /* PREPARE ANONYMIZED DATA */
        const update_data: { [key: string]: any } =
        {
            username: anonymous_username,
            email: anonymous_email,
            display_name: anonymous_display_name,
            is_anonymized: true,
            updated_at: new Date().toISOString()
        };

        /* REMOVE AVATAR IF EXISTS */
        if (user.avatar_url)
        {
            await file_service.delete_avatar_file(user.avatar_url);
            update_data.avatar_url = null;
        }

        /* UPDATE USER WITH ANONYMIZED DATA */
        const updated_user: User | null = await user_service.update_user(user_id, update_data);

        if (!updated_user)
        {
            reply.code(500).send({ error: "Failed to anonymize user" });
            return;
        }

        reply.code(200).send({ message: "User data anonymized successfully" });
    }
    catch (error)
    {
        console.error("Error anonymizing user:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Deletes the user account and all associated data
 */
async function delete_account(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { confirm_password } = request.body as { confirm_password: string };

        if (!confirm_password)
        {
            reply.code(400).send({ error: "Password confirmation is required" });
            return;
        }

        /* VERIFY USER AND PASSWORD */
        const is_valid: boolean = await user_service.verify_user_password(user_id, confirm_password);

        if (!is_valid)
        {
            reply.code(401).send({ error: "Invalid password" });
            return;
        }

        /* GET USER DATA */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        /* DELETE AVATAR IF EXISTS */
        if (user.avatar_url)
        {
            await file_service.delete_avatar_file(user.avatar_url);
        }

        /* DELETE USER AND ASSOCIATED DATA */
        const is_deleted: boolean = await user_service.delete_user(user_id);

        if (!is_deleted)
        {
            reply.code(500).send({ error: "Failed to delete user account" });
            return;
        }

        reply.code(200).send({ message: "User account deleted successfully" });
    }
    catch (error)
    {
        console.error("Error deleting user account:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default
{
    get_user_data,
    anonymize_user,
    delete_account
};
