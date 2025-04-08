/*
frontend/src/components/Game/MultiplayerGame.tsx

This file contains the component for three-player multiplayer mode.
Handles player name input, game initialization, unique three-player mechanics,
score tracking, and match result saving. Extends the standard Pong experience
with an additional bottom paddle and player.
*/


import React, { useState } from "react";
import { Player } from "./Types";
import { sanitize_input } from "./InputValidation";
import RenderGame from "./RenderGame";
import { generate_game_token } from "./TokenValidation";
import { match_api } from "../../services/api";
import { use_authentication } from "../../context/AuthenticationContext";


/**
 * Component for the 3-player multiplayer mode
 */
const MultiplayerGame: React.FC = () =>
{
    const { user } = use_authentication();
    const [player2_name, set_player2_name] = useState<string>("");
    const [player3_name, set_player3_name] = useState<string>("");
    const [error, set_error] = useState<string>("");
    const [game_started, set_game_started] = useState<boolean>(false);
    const [player1, set_player1] = useState<Player | null>(null);
    const [player2, set_player2] = useState<Player | null>(null);
    const [player3, set_player3] = useState<Player | null>(null);
    const [game_token, set_game_token] = useState<string>(generate_game_token());
    const [game_result, set_game_result] = useState<{
        winner: Player,
        completed: boolean,
        player1_score: number,
        player2_score: number,
        player3_score: number
    } | null>(null);
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

        if (!player2_name.trim() || !player3_name.trim())
        {
            set_error("Names for both opponents are required");
            return;
        }

        if (user.display_name === player2_name.trim() || user.display_name === player3_name.trim())
        {
            set_error("Players must have different names");
            return;
        }

        if (player2_name.trim() === player3_name.trim())
        {
            set_error("Players must have different names");
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

        const new_player3: Player =
        {
            id: "player3",
            alias: sanitize_input(player3_name.trim()),
            wins: 0,
            user_id: undefined
        };

        set_player1(new_player1);
        set_player2(new_player2);
        set_player3(new_player3);
        set_game_started(true);
        set_match_saved(false);
    };

    /**
     * Handles end of match and saves results
     */
    const handle_game_complete = (winner: Player, score: { left: number, right: number, bottom?: number }) =>
    {
        if (is_saving_match || match_saved)
            return;

        set_is_saving_match(true);

        const bottom_score = score.bottom !== undefined ? score.bottom : 0;

        let user_score = 0;
        let highest_opponent_score = 0;

        if (user && player1 && player1.user_id === user.id)
        {
            user_score = score.left;
            highest_opponent_score = Math.max(score.right, bottom_score);
        }
        else if (user && player2 && player2.user_id === user.id)
        {

            user_score = score.right;
            highest_opponent_score = Math.max(score.left, bottom_score);
        }
        else if (user && player3 && player3.user_id === user.id)
        {
            user_score = bottom_score;
            highest_opponent_score = Math.max(score.left, score.right);
        }
        else
        {
            user_score = score.left;
            highest_opponent_score = Math.max(score.right, bottom_score);
        }

        set_game_result({
            winner,
            completed: true,
            player1_score: score.left,
            player2_score: score.right,
            player3_score: bottom_score
        });

        /* SAVE MATCH TO DATABASE IF THERE'S A LOGGED-IN USER */
        if (user)
        {
            const opponent_id = 1;

            console.log(`Saving multiplayer match with scores: ${user_score}-${highest_opponent_score} (original: ${score.left}-${score.right}-${bottom_score})`);

            /* SAVE MATCH VIA API */
            match_api.create_match(opponent_id, "Multiplayer Match").then(response =>
            {
                const match_id = response.data.match.id;
                return match_api.update_match_result(match_id, user_score, highest_opponent_score);
            })
                .then(() =>
                {
                    console.log("Multiplayer match saved successfully");
                    set_match_saved(true);
                })
                .catch(error =>
                {
                    console.error("Error saving multiplayer match:", error);
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
        set_player2_name("");
        set_player3_name("");
        set_match_saved(false);
    };


    /**
     * Shows form for name input or the game itself
     */
    if (!game_started)
    {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">3-Player Multiplayer</h2>

                <div className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="player1" className="block text-gray-700 mb-2">
                            Player 1 (Left Paddle)
                        </label>
                        <div className="w-full px-4 py-2 border rounded bg-gray-100 text-gray-700">
                            {user ? user.display_name : "Please log in to play"}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="player2" className="block text-gray-700 mb-2">
                            Player 2 (Right Paddle)
                        </label>
                        <input
                            type="text"
                            id="player2"
                            value={player2_name}
                            onChange={(e) => set_player2_name(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Player 2 name"
                            maxLength={15}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="player3" className="block text-gray-700 mb-2">
                            Player 3 (Bottom Paddle)
                        </label>
                        <input
                            type="text"
                            id="player3"
                            value={player3_name}
                            onChange={(e) => set_player3_name(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Player 3 name"
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
                        Start Multiplayer Match
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
                        Final Score: {game_result.player1_score} - {game_result.player2_score} - {game_result.player3_score}
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
            {player1 && player2 && player3 && (
                <RenderGame
                    player1={player1}
                    player2={player2}
                    player3={player3}
                    on_game_complete={handle_game_complete}
                    token={game_token}
                    is_multiplayer={true}
                    game_type="Multiplayer"
                />
            )}
        </div>
    );
};


export default MultiplayerGame;
