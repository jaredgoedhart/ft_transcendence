/*
backend/src/routes/gdpr_routes.ts

This file defines API routes related to GDPR compliance (data privacy rules) features.
Registers endpoints for users to access their personal data,
anonymize their account, or completely delete their account.
All routes require authentication via JWT middleware.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import gdpr_controller from "../controllers/gdpr_controller";


/**
 * Registers routes for GDPR-related functionality
 * All routes under "/api/gdpr" are protected and require authentication
 */
async function gdpr_routes(fastify: FastifyInstance): Promise<void>
{
    /* ALL ROUTES UNDER /API/GDPR ARE PROTECTED AND REQUIRE AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE TO ALL ROUTES */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* GET USER'S PERSONAL DATA (DATA PORTABILITY) */
        protected_routes.get("/data", (request: FastifyRequest, reply: FastifyReply) =>
        {
            gdpr_controller.get_user_data(request, reply);
        });

        /* ANONYMIZE USER ACCOUNT */
        protected_routes.post("/anonymize", (request: FastifyRequest, reply: FastifyReply) =>
        {
            gdpr_controller.anonymize_user(request, reply);
        });

        /* DELETE USER ACCOUNT */
        protected_routes.post("/delete-account", (request: FastifyRequest, reply: FastifyReply) =>
        {
            gdpr_controller.delete_account(request, reply);
        });

    }, { prefix: "/api/gdpr" });
}


export default gdpr_routes;
