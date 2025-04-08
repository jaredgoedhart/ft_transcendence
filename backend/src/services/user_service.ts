/*
backend/src/services/user_service.ts

This file provides services for user management operations.
Contains functions for creating, retrieving, updating and deleting users,
handling authentication, and managing user-related data like matches and friends.
*/


import database from "../config/database";
import { User } from "../models/user";
import bcrypt from "bcrypt";


/**
 * Creates a new user in the database with a user_data object as the function argument
 */
async function create_user(user_data: {
    username: string,
    email: string,
    password: string,
    display_name: string,
    google_id?: string
}): Promise<User | null>
{
    try
    {
        /* CHECK IF DISPLAY NAME IS ALREADY TAKEN */
        const display_name_taken = await is_display_name_taken(user_data.display_name, 0);
        if (display_name_taken)
        {
            console.error(`Display name '${user_data.display_name}' is already taken`);
            return null;
        }

        /* GENERATE PASSWORD HASH */
        const salt_rounds: number = 10;
        const password_hash: string = await bcrypt.hash(user_data.password, salt_rounds);

        /* GENERATE TIMESTAMP IN THE FOLLOWING FORMAT YYYY-MM-DDTHH:mm:ss.sssZ */
        const current_time: string = new Date().toISOString();

        return new Promise((resolve, reject) =>
        {
            let query: string;
            let params: any[];

            if (user_data.google_id)
            {
                query = "INSERT INTO users (username, email, password_hash, display_name, google_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";
                params = [
                    user_data.username,
                    user_data.email,
                    password_hash,
                    user_data.display_name,
                    user_data.google_id,
                    current_time,
                    current_time
                ];
            }
            else
            {
                query = "INSERT INTO users (username, email, password_hash, display_name, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";
                params = [
                    user_data.username,
                    user_data.email,
                    password_hash,
                    user_data.display_name,
                    current_time,
                    current_time
                ];
            }

            database.run
            (
                query,
                params,
                function(this: any, error: Error | null)
                {
                    if (error)
                    {
                        console.error("Error creating user:", error.message);
                        reject(error);
                        return;
                    }

                    const user_id: number = this.lastID;
                    get_user_by_id(user_id).then(user => resolve(user)).catch(error => reject(error));
                }
            );
        });
    }
    catch (error)
    {
        console.error("Error in create_user:", error);
        return null;
    }
}


/**
 * Checks if a display name is already taken by another user
 */
async function is_display_name_taken(display_name: string, exclude_user_id: number): Promise<boolean>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT id FROM users WHERE display_name = ? AND id != ?";

        database.get(query, [display_name, exclude_user_id], (error: Error | null, row: any) =>
        {
            if (error)
            {
                console.error("Error checking for duplicate display_name:", error.message);
                reject(error);
                return;
            }

            resolve(!!row); // Returns true if a user with this display_name exists
        });
    });
}


/**
 * Retrieves a user by ID
 */
async function get_user_by_id(user_id: number): Promise<User | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM users WHERE id = ?";

        database.get(query, [user_id], (error: Error | null, row: User) =>
        {
            if (error)
            {
                console.error("Error getting user by ID:", error.message);
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
 * Retrieves a user by username or email
 */
async function get_user_by_username_or_email(identifier: string): Promise<User | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM users WHERE username = ? OR email = ?";

        database.get(query, [identifier, identifier], (error: Error | null, row: User) =>
        {
            if (error)
            {
                console.error("Error getting user by username or email:", error.message);
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
 * Retrieves a user by Google ID
 */
async function get_user_by_google_id(google_id: string): Promise<User | null>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = "SELECT * FROM users WHERE google_id = ?";

        database.get(query, [google_id], (error: Error | null, row: User) =>
        {
            if (error)
            {
                console.error("Error getting user by Google ID:", error.message);
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
 * Validates user credentials and returns the user if valid
 */
async function validate_user_credentials(identifier: string, password: string): Promise<User | null>
{
    try
    {
        const user: User | null = await get_user_by_username_or_email(identifier);

        if (!user)
            return null;

        const is_password_valid: boolean = await bcrypt.compare(password, user.password_hash);

        if (!is_password_valid)
            return null;

        return user;
    }
    catch (error)
    {
        console.error("Error validating user credentials:", error);
        return null;
    }
}


/**
 * Updates a user's information
 */
async function update_user(user_id: number, update_data: { [key: string]: any }): Promise<User | null>
{
    if (update_data.display_name)
    {
        try
        {
            const is_taken = await is_display_name_taken(update_data.display_name, user_id);
            if (is_taken)
            {
                console.log(`Display name '${update_data.display_name}' is already taken`);
                return null;
            }
        }
        catch (error)
        {
            console.error("Error checking display name:", error);
            return null;
        }
    }

    const fields: string[] = Object.keys(update_data);
    const values: any[] = Object.values(update_data);

    /* NO FIELDS TO UPDATE */
    if (fields.length === 0)
        return null;

    /* BUILD SET CLAUSE FOR SQL QUERY */
    const set_clause: string = fields.map(field => `${field} = ?`).join(", ");

    return new Promise((resolve, reject) =>
    {
        const query: string = `UPDATE users SET ${set_clause} WHERE id = ?`;

        /* ADD USER_ID TO VALUES ARRAY FOR WHERE CLAUSE */
        values.push(user_id);

        database.run(query, values, function(this: any, error: Error | null)
        {
            if (error)
            {
                console.error("Error updating user:", error.message);
                reject(error);
                return;
            }

            if (this.changes === 0)
            {
                resolve(null);
                return;
            }

            /* GET UPDATED USER DATA */
            get_user_by_id(user_id).then(user => resolve(user)).catch(error => reject(error));
        });
    });
}


/**
 * Verifies a user's password
 */
async function verify_user_password(user_id: number, password: string): Promise<boolean>
{
    try
    {
        const user: User | null = await get_user_by_id(user_id);

        if (!user)
            return false;

        return bcrypt.compare(password, user.password_hash);
    }
    catch (error)
    {
        console.error("Error verifying password:", error);
        return false;
    }
}


/**
 * Gets all match history for a user
 */
async function get_user_matches(user_id: number): Promise<any[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = `
            SELECT m.*,
                   u1.username as player1_username,
                   u2.username as player2_username,
                   u3.username as winner_username
            FROM matches m
                     LEFT JOIN users u1 ON m.player1_id = u1.id
                     LEFT JOIN users u2 ON m.player2_id = u2.id
                     LEFT JOIN users u3 ON m.winner_id = u3.id
            WHERE m.player1_id = ? OR m.player2_id = ?
            ORDER BY m.created_at DESC
        `;

        database.all(query, [user_id, user_id], (error: Error | null, rows: any[]) =>
        {
            if (error)
            {
                console.error("Error getting user matches:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


/**
 * Gets all friends for a user
 */
async function get_user_friends(user_id: number): Promise<any[]>
{
    return new Promise((resolve, reject) =>
    {
        const query: string = `
            SELECT f.*, 
                   u1.username as user_username, 
                   u2.username as friend_username
            FROM friendships f
            LEFT JOIN users u1 ON f.user_id = u1.id
            LEFT JOIN users u2 ON f.friend_id = u2.id
            WHERE f.user_id = ? OR f.friend_id = ?
            ORDER BY f.created_at DESC
        `;

        database.all(query, [user_id, user_id], (error: Error | null, rows: any[]) =>
        {
            if (error)
            {
                console.error("Error getting user friends:", error.message);
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });
}


/**
 * Deletes a user account and all related data
 */
async function delete_user(user_id: number): Promise<boolean>
{
    try
    {
        return new Promise((resolve, reject) =>
        {
            /* BEGIN TRANSACTION */
            database.run("BEGIN TRANSACTION", async (error: Error | null) =>
            {
                if (error)
                {
                    console.error("Error starting transaction:", error.message);
                    reject(error);
                    return;
                }

                try
                {
                    /* DELETE FRIENDSHIPS */
                    await new Promise<void>((res, rej) =>
                    {
                        database.run("DELETE FROM friendships WHERE user_id = ? OR friend_id = ?",
                            [user_id, user_id],
                            (error: Error | null) =>
                            {
                                if (error) rej(error);
                                else res();
                            }
                        );
                    });

                    /* ANONYMIZE MATCHES (WE DON'T DELETE THEM TO PRESERVE GAME HISTORY) */
                    await new Promise<void>((res, rej) =>
                    {
                        database.run(
                            "UPDATE matches SET winner_id = NULL WHERE winner_id = ?",
                            [user_id],
                            (error: Error | null) =>
                            {
                                if (error) rej(error);
                                else res();
                            }
                        );
                    });

                    /* DELETE USER */
                    const result = await new Promise<number>((res, rej) =>
                    {
                        database.run("DELETE FROM users WHERE id = ?", [user_id], function(this: any, error: Error | null)
                        {
                            if (error) rej(error);
                            else res(this.changes);
                        });
                    });

                    /* COMMIT TRANSACTION */
                    database.run("COMMIT", (error: Error | null) =>
                    {
                        if (error)
                        {
                            console.error("Error committing transaction:", error.message);
                            reject(error);
                            return;
                        }

                        resolve(result > 0);
                    });
                }
                catch (inner_error)
                {
                    /* ROLLBACK ON ERROR */
                    database.run("ROLLBACK", () =>
                    {
                        console.error("Transaction rolled back:", inner_error);
                        reject(inner_error);
                    });
                }
            });
        });
    }
    catch (error)
    {
        console.error("Error deleting user:", error);
        return false;
    }
}


export default
{
    create_user,
    get_user_by_id,
    get_user_by_username_or_email,
    get_user_by_google_id,
    validate_user_credentials,
    update_user,
    verify_user_password,
    get_user_matches,
    get_user_friends,
    delete_user,
    is_display_name_taken
};