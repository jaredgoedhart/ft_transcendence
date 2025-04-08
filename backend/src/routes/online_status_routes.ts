/*
backend/src/routes/online_status_routes.ts

This file defines routes for user online status management.
Registers WebSocket endpoint for real-time status updates and
HTTP endpoint for retrieving currently online users.
WebSocket connections require a valid JWT token.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import online_status_controller from "../controllers/online_status_controller";


/**
 * Registers online status routes
 */
async function online_status_routes(fastify: FastifyInstance): Promise<void>
{
    /* WEBSOCKET ENDPOINT FOR STATUS UPDATES */
    fastify.get("/api/status/ws", { websocket: true }, (connection, request) =>
    {
        online_status_controller.handle_status_connection(connection, request);
    });

    /* HTTP ENDPOINT FOR CHECKING ONLINE USERS */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* GET ONLINE USERS */
        protected_routes.get("/", (request: FastifyRequest, reply: FastifyReply) =>
        {
            online_status_controller.get_online_status(request, reply);
        });

    }, { prefix: "/api/status" });
}


export default online_status_routes;
