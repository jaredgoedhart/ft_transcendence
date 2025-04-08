/*
frontend/src/components/Game/ScoreDisplay.tsx

This file contains the component for displaying game scores.
Shows current player scores during matches with visual formatting
for both two-player and three-player game modes. Adapts its display
based on the current game configuration.
*/


import React from "react";
import { Player, Score } from "./Types";


interface ScoreDisplayProperties
{
    player1: Player;
    player2: Player;
    player3?: Player;
    score: Score;
    points_to_win: number;
    is_multiplayer?: boolean;
}


/**
 * Displays the game score and player information
 */
export const ScoreDisplay: React.FC<ScoreDisplayProperties> = ({
                                                                   player1,
                                                                   player2,
                                                                   player3,
                                                                   score,
                                                                   points_to_win,
                                                                   is_multiplayer = false
                                                               }) =>
{
    if (is_multiplayer && player3)
    {
        return (
            <div className="mb-4 w-full max-w-2xl">
                {/* 3 PLAYER LAYOUT */}
                <div className="grid grid-cols-3 w-full">
                    <div className="text-center">
                        <p className="font-bold">{player1.alias}</p>
                        <p className="text-2xl">{score.left}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">{player2.alias}</p>
                        <p className="text-2xl">{score.right}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">{player3.alias}</p>
                        <p className="text-2xl">{score.bottom !== undefined ? score.bottom : 0}</p>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-sm">First to {points_to_win} points</p>
                </div>
            </div>
        );
    }

    /* STANDARD 2 PLAYER LAYOUT */
    return (
        <div className="mb-4 grid grid-cols-3 w-full max-w-2xl">
            <div className="text-center">
                <p className="font-bold">{player1.alias}</p>
                <p className="text-2xl">{score.left}</p>
            </div>
            <div className="text-center">
                <p className="font-bold">VS</p>
                <p className="text-sm">First to {points_to_win} points</p>
            </div>
            <div className="text-center">
                <p className="font-bold">{player2.alias}</p>
                <p className="text-2xl">{score.right}</p>
            </div>
        </div>
    );
};
