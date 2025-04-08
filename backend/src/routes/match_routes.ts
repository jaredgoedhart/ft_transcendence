/*
backend/src/routes/match_routes.ts

This file defines API routes related to game matches.
Registers endpoints for creating matches, updating match results,
retrieving match history, and fetching match statistics.
All routes require authentication via JWT middleware.
*/


import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import match_controller from "../controllers/match_controller";


/**
 * Registers match history and statistics routes
 */
async function match_routes(fastify: FastifyInstance): Promise<void>
{
    /* ALL MATCH ROUTES REQUIRE AUTHENTICATION */
    fastify.register(async (protected_routes: FastifyInstance) =>
    {
        /* ADD AUTHENTICATION MIDDLEWARE */
        protected_routes.addHook("onRequest", (request: any, reply: any, done: Function) =>
        {
            fastify.authenticate(request, reply, done);
        });

        /* CREATE A NEW MATCH */
        protected_routes.post("/", (request: FastifyRequest, reply: FastifyReply) =>
        {
            match_controller.create_match(request, reply);
        });

        /* UPDATE MATCH RESULT */
        protected_routes.put("/result", (request: FastifyRequest, reply: FastifyReply) =>
        {
            match_controller.update_match_result(request, reply);
        });

        /* GET MATCH HISTORY */
        protected_routes.get("/history", (request: FastifyRequest, reply: FastifyReply) =>
        {
            match_controller.get_match_history(request, reply);
        });

        /* GET MATCH STATISTICS */
        protected_routes.get("/statistics", (request: FastifyRequest, reply: FastifyReply) =>
        {
            match_controller.get_match_statistics(request, reply);
        });

    }, { prefix: "/api/matches" });
}


export default match_routes;
