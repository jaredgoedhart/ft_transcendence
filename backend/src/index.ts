/*
backend/src/index.ts

This file is the entry point for the Fastify server.
It loads environment variables from the ".env" file and sets up the Fastify server instance.

- **Plugins**: Registers several plugins including JWT authentication, CORS handling, static file serving, file upload support, and WebSocket communication.
- **Routes**: Registers API routes for user management, two-factor authentication, friendships, online status, matches, and GDPR compliance.
- **Server Setup**: Initializes the Fastify server, binds it to a specified port (default 3001), and handles server startup and error handling.

This file is responsible for starting the server and ensuring all necessary plugins and routes are available.
*/



import { config } from "dotenv";
import jwt_plugin from "./plugins/jwt";
import cors_plugin from "./plugins/cors";
import static_plugin from "./plugins/static";
import multipart_plugin from "./plugins/multipart";
import user_routes from "./routes/user_routes";
import fastify, { FastifyInstance } from "fastify";
import two_factor_routes from "./routes/two_factor_routes";
import friendship_routes from "./routes/friendship_routes";
import authentication_routes from "./routes/authentication_routes";
import websocket_plugin from "./plugins/websocket";
import online_status_routes from "./routes/online_status_routes";
import match_routes from "./routes/match_routes";
import gdpr_routes from "./routes/gdpr_routes";

import "./models/user";
import "./models/friendship";
import "./models/match";


/* LOAD ENVIRONMENT VARIABLES FROM ROOT .env FILE */
config({ path: "../.env" });


/**
 * Main server setup function for Fastify framework (Framework module requirement).
 */
async function start_server(): Promise<void>
{
    const server: FastifyInstance = fastify({ logger: true });

    /* REGISTER PLUGINS */
    await server.register(jwt_plugin);
    await server.register(cors_plugin);
    await server.register(static_plugin);
    await server.register(multipart_plugin);
    await server.register(websocket_plugin);

    /* REGISTER ROUTES */
    await server.register(user_routes);
    await server.register(two_factor_routes);
    await server.register(authentication_routes);
    await server.register(friendship_routes);
    await server.register(online_status_routes);
    await server.register(match_routes);
    await server.register(gdpr_routes);

    try
    {
        const server_listening_port: number = parseInt(process.env.BACKEND_PORT || "3001", 10);
        const host: string = "0.0.0.0";

        await server.listen({ port: server_listening_port, host });

        console.log(`Server is running on ${host}:${server_listening_port}`);
    }
    catch (error: any)
    {
        server.log.error(error);
        process.exit(1);
    }
}


/* START SERVER AND CATCH ANY UNEXPECTED ERRORS DURING STARTUP */
start_server().catch((error: Error) =>
{
    console.error("Failed to start server:", error);
    process.exit(1);
});