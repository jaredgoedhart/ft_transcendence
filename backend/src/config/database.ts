/*
backend/src/config/database.ts

This file contains the database connection configuration for the SQLite database.
Makes sure that the database directory exists and creates a connection
to the SQLite database with proper error handling.
*/


import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import sqlite3 from "sqlite3";


/**
 * Checks if the database directory exists and creates it if necessary.
 * @param directory_path Path of the directory that should exist.
 */
function ensure_database_directory_existence(directory_path: string): void
{
    if (!existsSync(directory_path))
    {
        mkdirSync(directory_path, { recursive: true });
    }
}


/**
 * Initialize the database connection and ensure the directory exists.
 * @returns sqlite3.Database instance for database interaction.
 */
function initialize_database(): sqlite3.Database
{
    const database_directory: string = join(__dirname, "../../db");

    ensure_database_directory_existence(database_directory);

    const database_path: string = join(database_directory, "transcendence.sqlite");

    try
    {
        const database: sqlite3.Database = new sqlite3.Database(database_path);
        console.log("Connected to the SQLite database at", database_path);
        return database;
    }
    catch (error: any)
    {
        console.error("Failed to connect to the SQLite database:", error.message);
        throw error;
    }
}


const database_instance: sqlite3.Database = initialize_database();


export default database_instance;
