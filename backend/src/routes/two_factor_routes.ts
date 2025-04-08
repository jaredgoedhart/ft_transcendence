/*
backend/src/routes/two_factor_routes.ts

This file defines API routes related to two-factor authentication.
Registers endpoints for generating 2FA setup, enabling/disabling 2FA,
and verifying 2FA tokens during login process.
Most routes require authentication via JWT middleware.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import two_factor_controller from "../controllers/two_factor_controller";


/**
 * Registers two-factor authentication routes
 */
async function two_factor_routes(fastify: FastifyInstance): Promise<void>
{
    /* 2FA TOKEN VERIFICATION (PUBLIC ROUTE) */
    fastify.post("/api/auth/verify-2fa", (request: FastifyRequest, reply: FastifyReply) =>
        two_factor_controller.verify_2fa_token(request, reply));

    /* PROTECTED ROUTES THAT REQUIRE AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE TO ALL ROUTES */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* GENERATE 2FA SETUP */
        protected_routes.get("/setup", (request: FastifyRequest, reply: FastifyReply) =>
            two_factor_controller.generate_2fa_setup(request, reply));

        /* ENABLE 2FA */
        protected_routes.post("/enable", (request: FastifyRequest, reply: FastifyReply) =>
            two_factor_controller.enable_2fa(request, reply));

        /* DISABLE 2FA */
        protected_routes.post("/disable", (request: FastifyRequest, reply: FastifyReply) =>
            two_factor_controller.disable_2fa(request, reply));

    }, { prefix: "/api/2fa" });
}


export default two_factor_routes;
