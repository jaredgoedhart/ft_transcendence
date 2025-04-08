/*
backend/src/routes/friendship_routes.ts

This file defines API routes for managing friendships.
It includes endpoints for sending, accepting, and rejecting friend requests,
removing friends, and getting a user's friends list.

All routes are protected with JWT authentication, which ensures only logged-in users can access them. The server checks the user's token before allowing access.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import friendship_controller from "../controllers/friendship_controller";


/**
 * Registers friendship management routes
 */
async function friendship_routes(fastify: FastifyInstance): Promise<void>
{
    /* ALL FRIENDSHIP ROUTES REQUIRE AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* GET ALL FRIENDS */
        protected_routes.get("/", (request: FastifyRequest, reply: FastifyReply) =>
        {
            friendship_controller.get_friends(request, reply);
        });

        /* SEND FRIEND REQUEST */
        protected_routes.post("/request", (request: FastifyRequest, reply: FastifyReply) =>
        {
            friendship_controller.send_friend_request(request, reply);
        });

        /* ACCEPT FRIEND REQUEST */
        protected_routes.post("/accept", (request: FastifyRequest, reply: FastifyReply) =>
        {
            friendship_controller.accept_friend_request(request, reply);
        });

        /* REJECT FRIEND REQUEST */
        protected_routes.post("/reject", (request: FastifyRequest, reply: FastifyReply) =>
        {
            friendship_controller.reject_friend_request(request, reply);
        });

        /* REMOVE FRIENDSHIP */
        protected_routes.delete("/:friendship_id", (request: FastifyRequest, reply: FastifyReply) =>
        {
            friendship_controller.remove_friendship(request, reply);
        });

    }, { prefix: "/api/friends" });
}


export default friendship_routes;
