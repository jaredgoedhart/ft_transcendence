/*
backend/src/plugins/jwt.ts

This file sets up JWT (JSON Web Token) authentication for the Fastify server.
It helps securely manage user logins by creating and checking tokens for protected routes.
This is important because it allows users to stay logged in without saving sensitive data on their device.
*/


import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt";


/**
 * Configures JWT authentication plugin for Fastify
 */
export default fp(async function(fastify: FastifyInstance)
{
    if (!process.env.JWT_SECRET)
    {
        console.error("ERROR: JWT_SECRET is not set in environment variables");
        process.exit(1);
    }

    fastify.register(fastifyJwt,
    {
        secret: process.env.JWT_SECRET,
        sign: {expiresIn: "24h"}
    } as FastifyJWTOptions);

    fastify.decorate("authenticate", async function(request: any, reply: any, done: Function)
    {
        try
        {
            await request.jwtVerify();
            done();
        }
        catch (error)
        {
            reply.code(401).send({ error: "Unauthorized: Invalid token" });
        }
    });
});
