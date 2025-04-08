/*
backend/src/controllers/user_avatar_controller.ts

This file contains controller functions for user avatar management.
Handles uploading, processing, and storing avatar images,
as well as updating user profiles with new avatar URLs.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import user_service from "../services/user_service";
import file_service from "../services/file_service";
import { User } from "../models/user";


/**
 * Processes avatar uploads
 */
async function upload_avatar(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        /* CHECK IF USER EXISTS */
        const user: User | null = await user_service.get_user_by_id(user_id);

        if (!user)
        {
            reply.code(404).send({ error: "User not found" });
            return;
        }

        /* GET FILE UPLOAD */
        const data = await request.file();

        if (!data)
        {
            reply.code(400).send({ error: "No file uploaded" });
            return;
        }

        /* CHECK FILE TYPE */
        const allowed_mime_types: string[] = ["image/jpeg", "image/png", "image/gif"];

        if (!allowed_mime_types.includes(data.mimetype))
        {
            reply.code(400).send({ error: "Invalid file type. Only JPEG, PNG, and GIF images are allowed" });
            return;
        }

        /* PROCESS FILE UPLOAD */
        const file_buffer: Buffer = await data.toBuffer();
        const file_path: string | null = await file_service.save_avatar_file(file_buffer, data.filename);

        if (!file_path)
        {
            reply.code(500).send({ error: "Failed to save avatar" });
            return;
        }

        /* DELETE OLD AVATAR IF IT EXISTS */
        if (user.avatar_url)
        {
            await file_service.delete_avatar_file(user.avatar_url);
        }

        /* UPDATE USER PROFILE WITH NEW AVATAR URL */
        const update_data: { [key: string]: any } =
        {
            avatar_url: file_path,
            updated_at: new Date().toISOString()
        };

        const updated_user: User | null = await user_service.update_user(user_id, update_data);

        if (!updated_user)
        {
            reply.code(500).send({ error: "Failed to update user profile" });
            return;
        }

        /* DON'T SEND PASSWORD HASH TO CLIENT */
        const { password_hash, ...user_without_password } = updated_user;

        reply.code(200).send({ message: "Avatar uploaded successfully", user: user_without_password });
    }
    catch (error)
    {
        console.error("Error uploading avatar:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default { upload_avatar };
