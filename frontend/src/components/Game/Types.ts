/*
frontend/src/components/Game/Types.ts

This file defines TypeScript interfaces for game entities and states, similar to structs in C.
Contains type definitions for players, matches, game states, paddles,
balls, and other core game elements. Ensures type safety and consistent
data structures throughout the application.
*/


export interface Player
{
    id: string;
    alias: string;
    wins: number;
    user_id?: number;
}


export interface Match
{
    player1: Player;
    player2: Player;
    player3?: Player;
    winner?: Player;
    is_complete: boolean;
    token: string;
    player1_score?: number;
    player2_score?: number;
    player3_score?: number;
    game_id?: number;
}


export interface StartMatch
{
    player1: Player;
    player2: Player;
    player3?: Player;
    player1_score: number;
    player2_score: number;
    player3_score?: number;
    is_complete: boolean;
    winner?: Player;
    game_id?: number;
    token?: string;
}


export interface Ball
{
    x: number;
    y: number;
    dx: number;
    dy: number;
}


export interface Paddle
{
    y: number;
}


export interface BottomPaddle
{
    x: number;
}


export interface GameStateReference
{
    paddle_left: Paddle;
    paddle_right: Paddle;
    paddle_bottom?: BottomPaddle;
    ball: Ball;
    token: string;
    is_multiplayer?: boolean;
}


export interface Score
{
    left: number;
    right: number;
    bottom?: number;
}


export interface ValidationError
{
    message: string;
    type: "error" | "warning";
}


export type GameState = "VALIDATING" | "TOURNAMENT_START" | "PLAYING" | "CONTINUE" | "MULTIPLAYER";

export type GameMode = "TOURNAMENT" | "DIRECT_MATCH" | "MULTIPLAYER";
