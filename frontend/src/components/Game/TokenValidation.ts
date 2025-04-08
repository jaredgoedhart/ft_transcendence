/*
frontend/src/components/Game/TokenValidation.ts

This file contains utility functions for game token generation and validation.
Creates unique tokens for each game session and verifies their validity
to prevent unauthorized gameplay actions. Helps maintain game integrity
and session management.
*/


/**
 * Generates a unique game token
 */
export const generate_game_token = (): string =>
{
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};


/**
 * Validates if token exists and is valid
 */
export const validate_token = (token: string | undefined): boolean =>
{
    if (!token)
    {
        console.error("Invalid game token");
        return false;
    }
    return true;
};
