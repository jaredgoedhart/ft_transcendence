/*
backend/src/plugins/websocket.ts

This file configures WebSocket support for the Fastify server.
Enables real-time bidirectional communication for features like online status
updates and live gameplay. Critical for any real-time feature that requires
instant data transmission without page refreshes.
*/


import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import { FastifyInstance } from "fastify";


/**
 * Sets up WebSocket support for Fastify
 * Configures WebSocket connections with a maximum payload size of 1MB
 * Used for real-time features like online status updates and game interactions
 */
export default fp(async function(fastify: FastifyInstance)
{
    fastify.register(websocket, {options: { maxPayload: 1048576}});
});
