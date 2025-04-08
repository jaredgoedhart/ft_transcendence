/*
backend/src/services/friendship_service.ts

This file provides services for friendship relationship management.
Contains functions for sending, accepting, and rejecting friend requests,
removing friendships, and retrieving detailed friendship information.
Handles the database operations for all friendship-related functionality.
*/


import database from "../config/database";
import { Friendship } from "../models/friendship";
import { User } from "../models/user";
import user_service from "./user_service";


/**
 * Sends a friend request to another user
 */
async function send_friend_request(user_id: number, friend_id: number): Promise<Friendship | null>
{
    try
    {
        /* CHECK IF USERS EXIST */
        const user: User | null = await user_service.get_user_by_id(user_id);
        const friend: User | null = await user_service.get_user_by_id(friend_id);

        if (!user || !friend)
            return null;

        /* PREVENT SELF-FRIENDSHIP */
        if (user_id === friend_id)
            return null;

        /* CHECK IF FRIENDSHIP ALREADY EXISTS */
        const existing_friendship: Friendship | null = await get_friendship(user_id, friend_id);

        if (existing_friendship)
            return existing_friendship;

        /* CREATE TIMESTAMP */
        const current_time: string = new Date().toISOString();

        return new Promise((resolve, reject) =>
        {
            const query: string = "INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?)";

            database.run
            (
                query,
                [user_id, friend_id, "pending", current_time, current_time],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error creating friendship:", error.message);
                        reject(error);
                        return;
                    }

                    const friendship_id: number = this.lastID;
                    get_friendship_by_id(friendship_id)
                        .then(friendship => resolve(friendship))
                        .catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in send_friend_request:", error);
        return null;
    }
}


/**
 * Accepts a friend request
 */
async function accept_friend_request(friendship_id: number, user_id: number): Promise<Friendship | null>
{
    try
    {
        /* CHECK IF FRIENDSHIP EXISTS AND USER IS THE RECIPIENT */
        const friendship: Friendship | null = await get_friendship_by_id(friendship_id);

        if (!friendship || friendship.friend_id !== user_id || friendship.status !== "pending")
            return null;

        /* UPDATE TIMESTAMP */
        const current_time: string = new Date().toISOString();

        return new Promise((resolve, reject) =>
        {
            const query: string = "UPDATE friendships SET status = ?, updated_at = ? WHERE id = ?";

            database.run
            (
                query,
                ["accepted", current_time, friendship_id],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error accepting friendship:", error.message);
                        reject(error);
                        return;
                    }

                    if (this.changes === 0)
                    {
                        resolve(null);
                        return;
                    }

                    get_friendship_by_id(friendship_id)
                        .then(friendship => resolve(friendship))
                        .catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in accept_friend_request:", error);
        return null;
    }
}


/**
 * Rejects a friend request
 */
async function reject_friend_request(friendship_id: number, user_id: number): Promise<Friendship | null>
{
    try
    {
        /* CHECK IF FRIENDSHIP EXISTS AND USER IS THE RECIPIENT */
        const friendship: Friendship | null = await get_friendship_by_id(friendship_id);

        if (!friendship || friendship.friend_id !== user_id || friendship.status !== "pending")
            return null;

        /* UPDATE TIMESTAMP */
        const current_time: string = new Date().toISOString();

        return new Promise((resolve, reject) =>
        {
            const query: string = "UPDATE friendships SET status = ?, updated_at = ? WHERE id = ?";

            database.run
            (
                query,
                ["rejected", current_time, friendship_id],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error rejecting friendship:", error.message);
                        reject(error);
                        return;
                    }

                    if (this.changes === 0)
                    {
                        resolve(null);
                        return;
                    }

                    get_friendship_by_id(friendship_id)
                        .then(friendship => resolve(friendship))
                        .catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in reject_friend_request:", error);
        return null;
    }
}


/**
 * Removes a friendship
 */
async function remove_friendship(friendship_id: number, user_id: number): Promise<boolean>
{
    try
    {
        /* CHECK IF FRIENDSHIP EXISTS AND USER IS INVOLVED */
        const friendship: Friendship | null = await get_friendship_by_id(friendship_id);

        if (!friendship || (friendship.user_id !== user_id && friendship.friend_id !== user_id))
            return false;

        return new Promise((resolve, reject) =>
        {
            const query: string = "DELETE FROM friendships WHERE id = ?";

            database.run
            (
                query,
                [friendship_id],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error removing friendship:", error.message);
                        reject(error);
                        return;
                    }

                    resolve(this.changes > 0);
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in remove_friendship:", error);
        return false;
    }
}


/**
 * Gets a friendship by ID
 * @internal Used by other functions in this service
 */
async function get_friendship_by_id(friendship_id: number): Promise<Friendship | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM friendships WHERE id = ?";

        database.get(query, [friendship_id], (error: Error | null, row: Friendship) =>
        {
            if (error)
            {
                console.error("Error getting friendship by ID:", error.message);
                reject(error);
                return;
            }

            if (!row)
            {
                resolve(null);
                return;
            }

            resolve(row);
        });
    });
}


/**
 * Gets a friendship between two users
 * @internal Used by other functions in this service
 */
async function get_friendship(user_id: number, friend_id: number): Promise<Friendship | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM friendships WHERE " +
            "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)";

        database.get(query, [user_id, friend_id, friend_id, user_id], (error: Error | null, row: Friendship) =>
        {
            if (error)
            {
                console.error("Error getting friendship:", error.message);
                reject(error);
                return;
            }

            if (!row)
            {
                resolve(null);
                return;
            }

            resolve(row);
        });
    });
}


/**
 * Gets all friendships for a user
 * @internal Used by other functions in this service
 */
async function get_friendships_for_user(user_id: number): Promise<Friendship[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM friendships WHERE user_id = ? OR friend_id = ?";

        database.all(query, [user_id, user_id], (error: Error | null, rows: Friendship[]) =>
        {
            if (error)
            {
                console.error("Error getting friendships for user:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


/**
 * Gets all friends for a user with detailed user information
 */
async function get_friends_with_details(user_id: number): Promise<any[]>
{
    try
    {
        const friendships: Friendship[] = await get_friendships_for_user(user_id);

        if (!friendships.length)
            return [];

        /* GET FRIEND DETAILS FOR EACH FRIENDSHIP */
        const friends_with_details: any[] = await Promise.all(
            friendships.map(async (friendship) =>
            {
                let friend_id: number;

                if (friendship.user_id === user_id)
                {
                    friend_id = friendship.friend_id;
                }
                else
                {
                    friend_id = friendship.user_id;
                }

                const friend: User | null = await user_service.get_user_by_id(friend_id);

                if (!friend)
                    return null;

                /* REMOVE SENSITIVE DATA */
                const { password_hash, email, ...friend_data } = friend;

                return {
                    friendship_id: friendship.id,
                    friendship_status: friendship.status,
                    is_sender: friendship.user_id === user_id,
                    friend: friend_data
                };
            })
        );

        return friends_with_details.filter(friend => friend !== null);
    }
    catch (error)
    {
        console.error("Error in get_friends_with_details:", error);
        return [];
    }
}


/* EXPORT ONLY THE FUNCTIONS NEEDED BY OTHER MODULES */
export default
{
    send_friend_request,
    accept_friend_request,
    reject_friend_request,
    remove_friendship,
    get_friends_with_details
};
