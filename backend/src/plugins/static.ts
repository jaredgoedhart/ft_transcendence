/*
backend/src/plugins/static.ts

This file sets up static file serving for the Fastify server.
It allows the server to send uploaded files (like avatar images) to clients using regular HTTP requests.
This is necessary for displaying content that users have uploaded.
*/


import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { FastifyInstance } from "fastify";
import fs from "fs";


/**
 * Configures static file serving for Fastify
 */
export default fp(async function (fastify: FastifyInstance)
{
    /* ENSURE UPLOADS DIRECTORIES EXIST */
    const uploads_dir = "/app/uploads";
    const avatars_dir = "/app/uploads/avatars";

    console.log("Static file directories:");
    console.log(`- Uploads: ${uploads_dir}`);
    console.log(`- Avatars: ${avatars_dir}`);

    if (!fs.existsSync(uploads_dir))
    {
        console.log(`Creating uploads directory: ${uploads_dir}`);
        fs.mkdirSync(uploads_dir, { recursive: true });
    }

    if (!fs.existsSync(avatars_dir))
    {
        console.log(`Creating avatars directory: ${avatars_dir}`);
        fs.mkdirSync(avatars_dir, { recursive: true });
    }

    /* SERVE UPLOADED FILES */
    fastify.register(fastifyStatic,
    {
        root: uploads_dir,
        prefix: "/uploads/",
        decorateReply: false,
    });

    /* LOG AVAILABLE AVATAR FILES */
    try
    {
        const avatar_files = fs.readdirSync(avatars_dir);
        console.log(`Available avatar files (${avatar_files.length}):`, avatar_files);
    }
    catch (error)
    {
        console.error("Error reading avatar directory:", error);
    }
});
