/*
backend/src/plugins/cors.ts

This file sets up CORS (Cross-Origin Resource Sharing) for the Fastify server.
It allows the frontend to send requests to the backend by specifying which websites can access the backend, what types of requests are allowed, and which headers are permitted.
This is important for security when the frontend and backend are on different domains or ports.
*/



import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import * as process from "node:process";


/**
 * Configures CORS (Cross-Origin Resource Sharing) plugin for Fastify
 * Makes sure that the frontend can makes request to the backend
 */
export default fp(async function(fastify: FastifyInstance)
{
    if (!process.env.CORS_ORIGIN)
    {
        console.error("ERROR: CORS_ORIGIN is not set in environment variables");
        process.exit(1);
    }

    fastify.register(fastifyCors,
    {
        origin: process.env.CORS_ORIGIN?.split(","),
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
        exposedHeaders: ["Content-Disposition"],
        preflightContinue: false,
        optionsSuccessStatus: 204
    });

});
