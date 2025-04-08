/*
backend/src/models/user.ts

This file defines the User interface and initializes the users table in the database.
Contains the data structure for user accounts with authentication information,
profile details, and settings like two-factor authentication.
*/


import database from "../config/database";


/**
 * User interface for type checking
 */
export interface User
{
    id: number;
    username: string;
    email: string;
    password_hash: string;
    display_name: string;
    avatar_url: string | null;
    is_online: boolean;
    two_factor_secret: string | null;
    two_factor_enabled: boolean;
    google_id: string | null;
    is_anonymized: boolean;
    created_at: string;
    updated_at: string;
}


/**
 * Initializes the users table in the database
 */
function initialize_user_table(): void
{
    const create_table_query: string = "CREATE TABLE IF NOT EXISTS users " +
        "(" +
        "    id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "    username TEXT NOT NULL UNIQUE," +
        "    email TEXT NOT NULL UNIQUE," +
        "    password_hash TEXT NOT NULL," +
        "    display_name TEXT NOT NULL," +
        "    avatar_url TEXT," +
        "    is_online INTEGER DEFAULT 0," +
        "    two_factor_secret TEXT," +
        "    two_factor_enabled INTEGER DEFAULT 0," +
        "    google_id TEXT UNIQUE," +
        "    is_anonymized INTEGER DEFAULT 0," +
        "    created_at TEXT NOT NULL," +
        "    updated_at TEXT NOT NULL" +
        ")";

    database.run(create_table_query, (error: Error | null) =>
    {
        if (error)
        {
            console.error("Error creating users table:", error.message);
            return;
        }

        console.log("Users table created or already exists");

        const check_column_query: string = "PRAGMA table_info(users)";

        database.all(check_column_query, (error: Error | null, columns: any[]) =>
        {
            if (error)
            {
                console.error("Error checking users table columns:", error.message);
                return;
            }

            const google_id_column = columns.find(col => col.name === 'google_id');

            if (!google_id_column)
            {
                const add_column_query: string =
                    "ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE";

                database.run(add_column_query, (error: Error | null) =>
                {
                    if (error)
                    {
                        console.error("Error adding google_id column:", error.message);
                        return;
                    }
                    console.log("Added google_id column to users table");
                });
            }
        });
    });
}


initialize_user_table();
