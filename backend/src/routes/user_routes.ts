/*
backend/src/routes/user_routes.ts

This file defines API routes related to user profile management.
Registers endpoints for retrieving and updating user profiles,
and handling user avatar uploads with file processing.
All routes require authentication via JWT middleware.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import user_controller from "../controllers/user_controller";
import user_avatar_controller from "../controllers/user_avatar_controller";


/**
 * Registers routes for user management, including user profiles and updates.
 * All routes under "/api/user" are protected and require authentication.
 *
 * Routes:
 * - GET /api/user/profile: Retrieves the profile information of the authenticated user.
 * - PUT /api/user/profile: Updates the profile information of the authenticated user.
 * - POST /api/user/avatar: Uploads an avatar image.
 */
async function user_routes(fastify: FastifyInstance): Promise<void>
{
    /* ALL ROUTES UNDER /API/USER ARE PROTECTED AND REQUIRE AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE TO ALL ROUTES */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            (fastify as any).authenticate(request, reply, done);
        });

        /* GET USER PROFILE */
        protected_routes.get("/profile", (request: FastifyRequest, reply: FastifyReply) =>
        {
            user_controller.get_profile(request, reply);
        });

        /* UPDATE USER PROFILE */
        protected_routes.put("/profile", (request: FastifyRequest, reply: FastifyReply) =>
        {
            user_controller.update_profile(request, reply);
        });

        /* UPLOAD AVATAR */
        protected_routes.post("/avatar",
            {
                config: {rawBody: true}
            },
            (request: FastifyRequest, reply: FastifyReply) =>
            {
                user_avatar_controller.upload_avatar(request, reply);
            });

    }, { prefix: "/api/user" });
}


export default user_routes;
