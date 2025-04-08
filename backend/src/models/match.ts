/*
backend/src/models/match.ts

This file defines the Match interface and initializes the matches table in the database.
Contains the data structure for game matches between users,
storing player information, scores, and game results.
*/


import database from "../config/database";


/**
 * Match interface for type checking
 */
export interface Match
{
    id: number;
    player1_id: number;
    player2_id: number;
    winner_id: number | null;
    player1_score: number;
    player2_score: number;
    game_type: string;
    created_at: string;
    updated_at: string;
}


/**
 * Initializes the matches table in the database
 */
function initialize_match_table(): void
{
    const create_table_query: string = "CREATE TABLE IF NOT EXISTS matches " +
        "(" +
        "    id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "    player1_id INTEGER NOT NULL," +
        "    player2_id INTEGER NOT NULL," +
        "    winner_id INTEGER," +
        "    player1_score INTEGER NOT NULL DEFAULT 0," +
        "    player2_score INTEGER NOT NULL DEFAULT 0," +
        "    game_type TEXT NOT NULL," +
        "    created_at TEXT NOT NULL," +
        "    updated_at TEXT NOT NULL," +
        "    FOREIGN KEY (player1_id) REFERENCES users(id)," +
        "    FOREIGN KEY (player2_id) REFERENCES users(id)," +
        "    FOREIGN KEY (winner_id) REFERENCES users(id)" +
        ")";

    database.run(create_table_query, (error: Error | null) =>
    {
        if (error)
        {
            console.error("Error creating matches table:", error.message);
            return;
        }

        console.log("Matches table created or already exists");
    });
}


initialize_match_table();
