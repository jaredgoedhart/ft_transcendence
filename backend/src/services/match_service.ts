/*
backend/src/services/match_service.ts

This file provides services for game match management.
Contains functions for creating matches, updating match results,
retrieving match history, and calculating match statistics.
Handles all database operations for match-related functionality.
*/


import database from "../config/database";
import { Match } from "../models/match";


/**
 * Creates a new match in the database
 */
async function create_match(match_data: { player1_id: number, player2_id: number, game_type: string }): Promise<Match | null>
{
    try
    {
        /* CREATE TIMESTAMP */
        const current_time: string = new Date().toISOString();

        /* CHECK FOR DOUBLE REGISTRATION */
        const recent_matches: Match[] = await get_recent_matches_between_players(match_data.player1_id, match_data.player2_id);
        const time_threshold: number = 10000;
        const current_timestamp: number = new Date(current_time).getTime();

        for (const match of recent_matches)
        {
            const match_timestamp: number = new Date(match.created_at).getTime();
            if (current_timestamp - match_timestamp < time_threshold)
            {
                console.log("Duplicated match detected within time threshold, returning existing match");
                return match;
            }
        }

        /* CREATE NEW MATCH */
        return new Promise((resolve, reject) =>
        {
            const query: string = "INSERT INTO matches (player1_id, player2_id, game_type, player1_score, player2_score, created_at, updated_at) " +
                "VALUES (?, ?, ?, 0, 0, ?, ?)";

            database.run
            (
                query,
                [
                    match_data.player1_id,
                    match_data.player2_id,
                    match_data.game_type,
                    current_time,
                    current_time
                ],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error creating match:", error.message);
                        reject(error);
                        return;
                    }

                    const match_id: number = this.lastID;

                    get_match_by_id(match_id).then(match => resolve(match)).catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in create_match:", error);
        return null;
    }
}


/**
 * Gets recent matches between two players
 */
async function get_recent_matches_between_players(player1_id: number, player2_id: number): Promise<Match[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = `
            SELECT * FROM matches
            WHERE (player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)
            ORDER BY created_at DESC LIMIT 5
        `;

        database.all(query, [player1_id, player2_id, player2_id, player1_id], (error: Error | null, rows: Match[]) =>
        {
            if (error)
            {
                console.error("Error getting recent matches between players:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


/**
 * Updates a match with the final scores and winner
 */
async function update_match_result(match_id: number, player1_score: number, player2_score: number): Promise<Match | null>
{
    try
    {
        /* GET THE MATCH */
        const match: Match | null = await get_match_by_id(match_id);

        if (!match)
            return null;

        /* DETERMINE WINNER BASED ON SCORES */
        let winner_id: number | null = null;

        if (player1_score > player2_score)
        {
            winner_id = match.player1_id;
        }
        else if (player2_score > player1_score)
        {
            winner_id = match.player2_id;
        }

        /* LOG VOOR DEBUGGING */
        console.log(`Match ${match_id}: Scores ${player1_score}-${player2_score}, Winner ID: ${winner_id}`);

        /* UPDATE MATCH RESULT IN DATABASE */
        const current_time: string = new Date().toISOString();

        return new Promise((resolve, reject) =>
        {
            const query: string = "UPDATE matches SET player1_score = ?, player2_score = ?, winner_id = ?, updated_at = ? WHERE id = ?";

            database.run
            (
                query,
                [player1_score, player2_score, winner_id, current_time, match_id],
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error updating match result:", error.message);
                        reject(error);
                        return;
                    }

                    if (this.changes === 0)
                    {
                        resolve(null);
                        return;
                    }

                    get_match_by_id(match_id)
                        .then(match => resolve(match))
                        .catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in update_match_result:", error);
        return null;
    }
}


/**
 * Gets a match by ID
 */
async function get_match_by_id(match_id: number): Promise<Match | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM matches WHERE id = ?";

        database.get(query, [match_id], (error: Error | null, row: Match) =>
        {
            if (error)
            {
                console.error("Error getting match by ID:", error.message);
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
 * Gets all matches for a user
 */
async function get_matches_for_user(user_id: number, limit: number = 10, offset: number = 0): Promise<Match[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM matches " +
            "WHERE player1_id = ? OR player2_id = ? " +
            "ORDER BY created_at DESC " +
            "LIMIT ? OFFSET ?";

        database.all(query, [user_id, user_id, limit, offset], (error: Error | null, rows: Match[]) =>
        {
            if (error)
            {
                console.error("Error getting matches for user:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


/**
 * Gets match statistics for a user
 */
async function get_user_match_statistics(user_id: number): Promise<{ total_matches: number, wins: number, losses: number, win_rate: number, avg_score: number }>
{
    try
    {
        const matches = await get_all_matches_for_user(user_id);

        let wins = 0;
        let losses = 0;
        let total_score = 0;

        for (const match of matches)
        {
            if (match.player1_id === user_id)
            {
                total_score += match.player1_score;

                if (match.player1_score > match.player2_score)
                {
                    wins++;
                }
                else if (match.player1_score < match.player2_score)
                {
                    losses++;
                }
            }
            else if (match.player2_id === user_id)
            {
                total_score += match.player2_score;

                if (match.player2_score > match.player1_score)
                {
                    wins++;
                }
                else if (match.player2_score < match.player1_score)
                {
                    losses++;
                }
            }
        }

        const total_matches = matches.length;
        const avg_score = total_matches > 0 ? total_score / total_matches : 0;
        const win_rate = (wins + losses > 0) ? (wins / (wins + losses) * 100) : 0;

        console.log(`Statistieken voor gebruiker ${user_id}: ${wins} overwinningen, ${losses} nederlagen van ${total_matches} matches`);

        return {
            total_matches,
            wins,
            losses,
            win_rate,
            avg_score
        };
    }
    catch (error)
    {
        console.error("Error in get_user_match_statistics:", error);
        return { total_matches: 0, wins: 0, losses: 0, win_rate: 0, avg_score: 0 };
    }
}


/**
 * Gets all matches for a user without limits
 */
async function get_all_matches_for_user(user_id: number): Promise<Match[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM matches " +
            "WHERE player1_id = ? OR player2_id = ? " +
            "ORDER BY created_at DESC";

        database.all(query, [user_id, user_id], (error: Error | null, rows: Match[]) =>
        {
            if (error)
            {
                console.error("Error getting all matches for user:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


export default
{
    create_match,
    update_match_result,
    get_match_by_id,
    get_matches_for_user,
    get_user_match_statistics
};
