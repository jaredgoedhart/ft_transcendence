/*
backend/src/controllers/friendship_controller.ts

This file contains controller functions for friend-related operations.
Handles sending, accepting, and rejecting friend requests, removing friendships,
and retrieving a user's friends list with detailed information.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import friendship_service from "../services/friendship_service";
import { Friendship } from "../models/friendship";


/**
 * Sends a friend request to another user
 */
async function send_friend_request(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { friend_id } = request.body as { friend_id: number };

        if (!friend_id)
        {
            reply.code(400).send({ error: "Friend ID is required" });
            return;
        }

        const friendship: Friendship | null = await friendship_service.send_friend_request(user_id, friend_id);

        if (!friendship)
        {
            reply.code(400).send({ error: "Failed to send friend request" });
            return;
        }

        reply.code(200).send({ message: "Friend request sent successfully", friendship: friendship });
    }
    catch (error)
    {
        console.error("Error in send_friend_request controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Accepts a friend request
 */
async function accept_friend_request(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { friendship_id } = request.body as { friendship_id: number };

        if (!friendship_id)
        {
            reply.code(400).send({ error: "Friendship ID is required" });
            return;
        }

        const friendship: Friendship | null = await friendship_service.accept_friend_request(friendship_id, user_id);

        if (!friendship)
        {
            reply.code(400).send({ error: "Failed to accept friend request" });
            return;
        }

        reply.code(200).send({ message: "Friend request accepted successfully", friendship: friendship });
    }
    catch (error)
    {
        console.error("Error in accept_friend_request controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Rejects a friend request
 */
async function reject_friend_request(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { friendship_id } = request.body as { friendship_id: number };

        if (!friendship_id)
        {
            reply.code(400).send({ error: "Friendship ID is required" });
            return;
        }

        const friendship: Friendship | null = await friendship_service.reject_friend_request(friendship_id, user_id);

        if (!friendship)
        {
            reply.code(400).send({ error: "Failed to reject friend request" });
            return;
        }

        reply.code(200).send({ message: "Friend request rejected successfully", friendship: friendship });
    }
    catch (error)
    {
        console.error("Error in reject_friend_request controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Removes a friendship
 */
async function remove_friendship(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const { friendship_id } = request.params as { friendship_id: string };

        if (!friendship_id)
        {
            reply.code(400).send({ error: "Friendship ID is required" });
            return;
        }

        const success: boolean = await friendship_service.remove_friendship(parseInt(friendship_id), user_id);

        if (!success)
        {
            reply.code(400).send({ error: "Failed to remove friendship" });
            return;
        }

        reply.code(200).send({ message: "Friendship removed successfully" });
    }
    catch (error)
    {
        console.error("Error in remove_friendship controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Gets all friends for a user
 */
async function get_friends(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const friends: any[] = await friendship_service.get_friends_with_details(user_id);

        reply.code(200).send({ friends: friends });
    }
    catch (error)
    {
        console.error("Error in get_friends controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default
{
    send_friend_request,
    accept_friend_request,
    reject_friend_request,
    remove_friendship,
    get_friends
};
