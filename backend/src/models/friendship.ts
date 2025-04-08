/*
backend/src/models/friendship.ts

This file defines the Friendship interface and initializes the friendships table in the database.
Contains the data structure for friendship relationships between users,
with statuses like pending, accepted, or rejected.
*/


import database from "../config/database";


/**
 * Friendship interface for type checking
 */
export interface Friendship
{
    id: number;
    user_id: number;
    friend_id: number;
    status: "pending" | "accepted" | "rejected";
    created_at: string;
    updated_at: string;
}


/**
 * Initializes the friendships table in the database
 */
function initialize_friendship_table(): void
{
    const create_table_query: string = "CREATE TABLE IF NOT EXISTS friendships " +
        "(" +
        "    id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "    user_id INTEGER NOT NULL," +
        "    friend_id INTEGER NOT NULL," +
        "    status TEXT NOT NULL," +
        "    created_at TEXT NOT NULL," +
        "    updated_at TEXT NOT NULL," +
        "    FOREIGN KEY (user_id) REFERENCES users(id)," +
        "    FOREIGN KEY (friend_id) REFERENCES users(id)," +
        "    UNIQUE(user_id, friend_id)" +
        ")";

    database.run(create_table_query, (error: Error | null) =>
    {
        if (error)
        {
            console.error("Error creating friendships table:", error.message);
            return;
        }

        console.log("Friendships table created or already exists");
    });
}


initialize_friendship_table();
