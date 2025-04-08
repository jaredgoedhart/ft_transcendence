/*
backend/src/services/online_status_service.ts

This file provides services for managing user online status.
Contains functions for registering and removing WebSocket connections,
updating user online status in the database, and retrieving lists of online users.
Manages the real-time user presence tracking functionality.
*/


import database from "../config/database";


/**
 * Store for active connections
 */
const active_connections: Map<number, Set<any>> = new Map();


/**
 * Registers a new user connection
 */
async function register_connection(user_id: number, connection: any): Promise<void>
{
    let user_connections: Set<any> = active_connections.get(user_id) || new Set();
    user_connections.add(connection);
    active_connections.set(user_id, user_connections);

    console.log(`User ${user_id} connected. Total connections: ${user_connections.size}`);

    if (user_connections.size === 1)
    {
        await update_user_online_status(user_id, true);
    }
}


/**
 * Removes a user connection
 */
async function remove_connection(user_id: number, connection: any): Promise<void>
{
    const user_connections: Set<any> = active_connections.get(user_id) || new Set();
    user_connections.delete(connection);

    if (user_connections.size === 0)
    {
        active_connections.delete(user_id);

        /* UPDATE DATABASE STATUS TO OFFLINE WHEN ALL CONNECTIONS ARE CLOSED */
        await update_user_online_status(user_id, false);
    }
    else
    {
        active_connections.set(user_id, user_connections);
    }

    console.log(`User ${user_id} disconnected. Remaining connections: ${user_connections.size}`);
}


/**
 * Updates the online status of a user in the database
 */
async function update_user_online_status(user_id: number, is_online: boolean): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        const current_time: string = new Date().toISOString();
        const query: string = "UPDATE users SET is_online = ?, updated_at = ? WHERE id = ?";

        database.run(query, [is_online ? 1 : 0, current_time, user_id], function(error: Error | null)
        {
            if (error)
            {
                console.error(`Error updating online status for user ${user_id}:`, error.message);
                reject(error);
                return;
            }

            console.log(`Updated database online status for user ${user_id} to ${is_online ? 'online' : 'offline'}`);
            resolve();
        });
    });
}


/**
 * Gets all online users
 */
function get_online_users(): number[]
{
    return Array.from(active_connections.keys());
}


export default
{
    register_connection,
    remove_connection,
    get_online_users
};
