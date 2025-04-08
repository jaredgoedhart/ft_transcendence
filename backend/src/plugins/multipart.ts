/*
backend/src/plugins/multipart.ts

This file sets up handling for file uploads in the Fastify server.
It allows the server to process file uploads, such as user avatars, by handling multipart/form-data requests with size limits and validation.
This is necessary for any feature that involves uploading files.
*/


import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import { FastifyInstance } from "fastify";


/**
 * Configures multipart file upload support for Fastify
 * Sets a maximum file size of 5MB and limits uploads to one file per request
 * Used for handling file uploads such as user avatars and other attachments
 * Uses the standard Fastify request.file() method for processing uploaded files
 */
export default fp(async function(fastify: FastifyInstance)
{
    await fastify.register(multipart, {limits: {fileSize: 5 * 1024 * 1024, files: 1},});

    console.log("Multipart plugin registered successfully");
});
