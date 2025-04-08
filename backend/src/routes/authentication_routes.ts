/*
backend/src/routes/authentication_routes.ts

This file defines API routes for user authentication and registration.
It includes endpoints for user signup, login, and Google authentication.

Protected routes, such as the two-factor authentication step, are secured with JWT middleware to ensure only logged-in users can access them.
All authentication-related routes are available under the `/api/auth` endpoint.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import authentication_controller from "../controllers/authentication_controller";
import google_auth_controller from "../controllers/google_auth_controller";


/**
 * This function registers the authentication-related routes for user registration and login.
 */
async function authentication_routes(fastify: FastifyInstance): Promise<void>
{
    /* REGISTER USER */
    fastify.post("/api/auth/register", (request: FastifyRequest, reply: FastifyReply) =>
    {
        authentication_controller.register(request, reply);
    });

    /* LOGIN USER */
    fastify.post("/api/auth/login", (request: FastifyRequest, reply: FastifyReply) =>
    {
        authentication_controller.login(request, reply);
    });

    /* GOOGLE AUTHENTICATION */
    fastify.post("/api/auth/google", (request: FastifyRequest, reply: FastifyReply) =>
    {
        google_auth_controller.google_auth(request, reply);
    });

    /* PROTECTED ROUTES REQUIRING AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* 2FA LOGIN STEP */
        protected_routes.get("/two-factor", (request: FastifyRequest, reply: FastifyReply) =>
        {
            authentication_controller.two_factor_login(request, reply);
        });

    }, { prefix: "/api/auth" });
}


export default authentication_routes;
