/*
frontend/src/components/Game/DirectMatch.tsx

This file contains the component for direct 1V1 matches.
Handles player name input, game initialization, score tracking,
and match result saving. Provides a standalone game experience
separate from the tournament mode.
*/


import React, { useState } from "react";
import { Player } from "./Types";
import { sanitize_input } from "./InputValidation";
import RenderGame from "./RenderGame";
import { generate_game_token } from "./TokenValidation";
import { match_api } from "../../services/api";
import { use_authentication } from "../../context/AuthenticationContext";


/**
 * Component for direct 1v1 matches
 */
const DirectMatch: React.FC = () =>
{
    const { user } = use_authentication();
    const [player2_name, set_player2_name] = useState<string>("");
    const [error, set_error] = useState<string>("");
    const [game_started, set_game_started] = useState<boolean>(false);
    const [player1, set_player1] = useState<Player | null>(null);
    const [player2, set_player2] = useState<Player | null>(null);
    const [game_token, set_game_token] = useState<string>(generate_game_token());
    const [game_result, set_game_result] = useState<{ winner: Player, completed: boolean, player1_score: number, player2_score: number } | null>(null);
    const [is_saving_match, set_is_saving_match] = useState<boolean>(false);
    const [match_saved, set_match_saved] = useState<boolean>(false);


    /**
     * Validates player names and starts the match
     */
    const handle_start_game = () =>
    {
        set_error("");

        if (!user)
        {
            set_error("You must be logged in to play");
            return;
        }

        if (!player2_name.trim())
        {
            set_error("Opponent name is required");
            return;
        }

        if (user.display_name === player2_name.trim())
        {
            set_error("Opponent must have a different name");
            return;
        }

        const new_player1: Player =
        {
            id: "player1",
            alias: user.display_name,
            wins: 0,
            user_id: user.id
        };

        const new_player2: Player =
        {
            id: "player2",
            alias: sanitize_input(player2_name.trim()),
            wins: 0,
            user_id: undefined
        };

        set_player1(new_player1);
        set_player2(new_player2);
        set_game_started(true);
        set_match_saved(false);
    };


    /**
     * Handles end of match and saves results
     */
    const handle_game_complete = (winner: Player, score: { left: number, right: number }) =>
    {
        if (is_saving_match || match_saved)
            return;

        set_is_saving_match(true);

        const player1_score = score.left;
        const player2_score = score.right;

        set_game_result({
            winner,
            completed: true,
            player1_score,
            player2_score
        });

        /* SAVE MATCH TO DATABASE IF THERE'S A LOGGED-IN USER */
        if (user)
        {
            const opponent_id = 1;

            console.log(`Saving match with scores: ${player1_score}-${player2_score}`);

            /* SAVE MATCH VIA API */
            match_api.create_match(opponent_id, "Direct Match").then(response =>
            {
                const match_id = response.data.match.id;
                return match_api.update_match_result(match_id, player1_score, player2_score);
            })
                .then(() =>
                {
                    console.log("Match saved successfully");
                    set_match_saved(true);
                })
                .catch(error =>
                {
                    console.error("Error saving match:", error);
                })
                .finally(() =>
                {
                    set_is_saving_match(false);
                });
        }
        else
        {
            set_is_saving_match(false);
            set_match_saved(true);
        }
    };


    /**
     * Restarts the game after completion
     */
    const handle_play_again = () =>
    {
        set_game_started(false);
        set_game_result(null);
        set_game_token(generate_game_token());
        set_player2_name(""); // Reset opponent name input
        set_match_saved(false);
    };


    /**
     * Shows form for name input or the game itself
     */
    if (!game_started)
    {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">1-on-1 Match</h2>

                <div className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="player1" className="block text-gray-700 mb-2">
                            Player 1
                        </label>
                        <div className="w-full px-4 py-2 border rounded bg-gray-100 text-gray-700">
                            {user ? user.display_name : "Please log in to play"}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="player2" className="block text-gray-700 mb-2">
                            Player 2
                        </label>
                        <input
                            type="text"
                            id="player2"
                            value={player2_name}
                            onChange={(e) => set_player2_name(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Opponent name"
                            maxLength={15}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handle_start_game}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={!user}
                    >
                        Start Match
                    </button>
                </div>
            </div>
        );
    }


    /**
     * Shows result screen after the match
     */
    if (game_result && game_result.completed)
    {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Match Completed</h2>

                <div className="mb-6 p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-lg">
                        <span className="font-semibold">{game_result.winner.alias}</span> has won the match!
                    </p>
                    <p className="mt-2">
                        Final Score: {game_result.player1_score} - {game_result.player2_score}
                    </p>
                </div>

                <button
                    onClick={handle_play_again}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={is_saving_match}
                >
                    {is_saving_match ? "Saving match results..." : "Play Again"}
                </button>
            </div>
        );
    }


    /**
     * Shows the game itself
     */
    return (
        <div>
            {player1 && player2 && (
                <RenderGame
                    player1={player1}
                    player2={player2}
                    on_game_complete={handle_game_complete}
                    token={game_token}
                />
            )}
        </div>
    );
};


export default DirectMatch;
