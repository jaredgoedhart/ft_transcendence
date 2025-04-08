/*
backend/src/controllers/match_controller.ts

This file contains controller functions for match-related operations.
Handles creating new matches, updating match results, retrieving match history,
and calculating user match statistics.
*/


import { FastifyRequest, FastifyReply } from "fastify";
import match_service from "../services/match_service";
import user_service from "../services/user_service";
import { Match } from "../models/match";
import { User } from "../models/user";


/**
 * Creates a new match
 */
async function create_match(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { player2_id, game_type } = request.body as { player2_id: number, game_type: string };

        const player1_id: number = (request as any).user.id;

        if (!player2_id || !game_type)
        {
            reply.code(400).send({ error: "Player 2 ID and game type are required" });
            return;
        }

        /* CHECK IF BOTH PLAYERS EXIST */
        const player1: User | null = await user_service.get_user_by_id(player1_id);
        const player2: User | null = await user_service.get_user_by_id(player2_id);

        if (!player1 || !player2)
        {
            reply.code(404).send({ error: "One or both players not found" });
            return;
        }

        const match: Match | null = await match_service.create_match({ player1_id, player2_id, game_type });

        if (!match)
        {
            reply.code(500).send({ error: "Failed to create match" });
            return;
        }

        reply.code(201).send({ message: "Match created successfully", match: match });
    }
    catch (error)
    {
        console.error("Error in create_match controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Updates a match result
 */
async function update_match_result(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const { match_id, player1_score, player2_score } = request.body as { match_id: number, player1_score: number, player2_score: number };

        if (!match_id || player1_score === undefined || player2_score === undefined)
        {
            reply.code(400).send({ error: "Match ID and scores are required" });
            return;
        }

        /* GET THE MATCH */
        const match: Match | null = await match_service.get_match_by_id(match_id);

        if (!match)
        {
            reply.code(404).send({ error: "Match not found" });
            return;
        }

        /* VERIFY USER IS PARTICIPANT */
        const user_id: number = (request as any).user.id;

        if (match.player1_id !== user_id && match.player2_id !== user_id)
        {
            reply.code(403).send({ error: "You are not a participant in this match" });
            return;
        }

        /* UPDATE MATCH RESULT */
        const updated_match: Match | null = await match_service.update_match_result(
            match_id,
            player1_score,
            player2_score
        );

        if (!updated_match)
        {
            reply.code(500).send({ error: "Failed to update match result" });
            return;
        }

        reply.code(200).send( {message: "Match result updated successfully", match: updated_match });
    }
    catch (error)
    {
        console.error("Error in update_match_result controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Gets match history for the current user
 */
async function get_match_history(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;
        const limit: number = parseInt((request.query as any).limit || "10", 10);
        const offset: number = parseInt((request.query as any).offset || "0", 10);

        const matches: Match[] = await match_service.get_matches_for_user(user_id, limit, offset);

        reply.code(200).send({ matches });
    }
    catch (error)
    {
        console.error("Error in get_match_history controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


/**
 * Gets match statistics for the current user
 */
async function get_match_statistics(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    try
    {
        const user_id: number = (request as any).user.id;

        const statistics = await match_service.get_user_match_statistics(user_id);

        reply.code(200).send({ statistics });
    }
    catch (error)
    {
        console.error("Error in get_match_statistics controller:", error);
        reply.code(500).send({ error: "Internal server error" });
    }
}


export default { create_match, update_match_result, get_match_history, get_match_statistics };
