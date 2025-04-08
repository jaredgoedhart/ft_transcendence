/*
backend/src/controllers/online_status_controller.ts

This file contains controller functions for managing user online status.
It handles WebSocket connections for real-time status updates and
provides API endpoints that allow other systems or applications to retrieve information about online users.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import online_status_service from "../services/online_status_service";
import jwt from "jsonwebtoken";


/**
 * Handles WebSocket connections for user status
 */
async function handle_status_connection(connection: any, request: FastifyRequest): Promise<void>
{
    try
    {
        /* EXTRACT TOKEN FROM QUERY PARAMETERS */
        const { token } = request.query as { token: string };

        if (!token)
        {
            connection.socket.close(1008, "Authentication required");
            return;
        }

        /* VERIFY JWT TOKEN */
        if (!process.env.JWT_SECRET)
        {
            console.error("ERROR: JWT_SECRET is not set in environment variables");
            connection.socket.close(1011, "Server configuration error");
            return;
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id)
        {
            connection.socket.close(1008, "Invalid token");
            return;
        }

        const user_id: number = decoded.id;

        /* REGISTER CONNECTION */
        await online_status_service.register_connection(user_id, connection);

        /* HANDLE DISCONNECT */
        connection.socket.on("close", async () =>
        {
            await online_status_service.remove_connection(user_id, connection);
        });

        /* HANDLE MESSAGES */
        connection.socket.on("message", (message: Buffer) =>
        {
            try
            {
                const data = JSON.parse(message.toString());

                /* HANDLE PING TO KEEP CONNECTION ALIVE */
                if (data.type === "ping")
                {
                    connection.socket.send(JSON.stringify({ type: "pong" }));
                }
            }
            catch (error)
            {
                console.error("Error handling message:", error);
            }
        });
    }
    catch (error)
    {
        console.error("Error in handle_status_connection:", error);
        connection.socket.close(1011, "Internal server error");
    }
}


/**
 * Gets online status for all users
 */
async function get_online_status(_request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const online_users: number[] = online_status_service.get_online_users();

        reply.code(200).send({ online_users });
    }
    catch (error)
    {
        console.error("Error in get_online_status controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default { handle_status_connection, get_online_status };
