/*
backend/src/services/file_service.ts

This file handles file management tasks.
Includes functions to save and delete avatar files with checks for valid directories and error handling.
*/



import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";


/**
 * Saves an avatar image file to disk
 */
async function save_avatar_file(file_buffer: Buffer, original_filename: string): Promise<string | null>
{
    try
    {
        const upload_directory: string = "/app/uploads/avatars";

        console.log("Saving avatar to directory:", upload_directory);

        if (!fs.existsSync(upload_directory))
        {
            fs.mkdirSync(upload_directory, { recursive: true });
            console.log("Created directory:", upload_directory);
        }

        /* GENERATE UNIQUE FILENAME */
        const file_extension: string = path.extname(original_filename);
        const unique_filename: string = `${randomUUID()}${file_extension}`;
        const file_path: string = path.join(upload_directory, unique_filename);

        /* WRITE FILE TO DISK */
        fs.writeFileSync(file_path, file_buffer);
        console.log("Saved avatar file to:", file_path);

        /* RETURN RELATIVE FILE PATH FOR DATABASE STORAGE */
        return `/uploads/avatars/${unique_filename}`;
    }
    catch (error)
    {
        console.error("Error saving avatar file:", error);
        return null;
    }
}


/**
 * Deletes an avatar file from disk
 */
async function delete_avatar_file(file_path: string): Promise<boolean>
{
    try
    {
        /* ONLY DELETE FILES IN THE AVATARS DIRECTORY */
        if (!file_path.includes("/uploads/avatars/"))
        {
            return false;
        }

        const filename = path.basename(file_path);
        const absolute_path: string = path.join("/app/uploads/avatars", filename);

        console.log("Attempting to delete avatar file:", absolute_path);

        /* CHECK IF FILE EXISTS */
        if (!fs.existsSync(absolute_path))
        {
            console.log("File does not exist:", absolute_path);
            return false;
        }

        /* DELETE FILE */
        fs.unlinkSync(absolute_path);
        console.log("Successfully deleted avatar file:", absolute_path);

        return true;
    }
    catch (error)
    {
        console.error("Error deleting avatar file:", error);
        return false;
    }
}


export default
{
    save_avatar_file,
    delete_avatar_file
};
