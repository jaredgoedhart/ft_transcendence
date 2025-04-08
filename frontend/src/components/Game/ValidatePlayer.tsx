// FRONTEND: frontend/src/components/Game/ValidatePlayer.tsx


import React, { useState, useEffect } from "react";
import { Player, ValidationError } from "./Types";
import { PlayerRegistrationForm } from "./PlayerRegistrationForm";
import { PlayersList } from "./PlayersList";
import { use_authentication } from "../../context/AuthenticationContext";


interface ValidatePlayerProps
{
    on_players_validated: (players: Player[]) => void;
}


/**
 * Component for player registration and validation
 */
const ValidatePlayer: React.FC<ValidatePlayerProps> = ({ on_players_validated }) =>
{
    const { user } = use_authentication();
    const [players, set_players] = useState<Player[]>([]);
    const [new_player_alias, set_new_player_alias] = useState<string>("");
    const [error, set_error] = useState<ValidationError | null>(null);

    const MAX_PLAYERS = 3;


    /**
     * Adds logged-in user as first player on component mount
     */
    useEffect(() =>
    {
        if (user && players.length === 0)
        {
            const logged_in_player: Player =
            {
                id: "logged_in_" + user.id,
                alias: user.display_name,
                wins: 0,
                user_id: user.id
            };

            set_players([logged_in_player]);
        }
    }, [user]);


    /**
     * Adds a new player to the tournament
     */
    const handle_add_player = (player: Player) =>
    {
        if (players.length >= MAX_PLAYERS)
        {
            set_error({
                message: `Maximum number of players (${MAX_PLAYERS}) reached`,
                type: "error"
            });
            return;
        }

        set_players([...players, player]);
    };


    /**
     * Validates and starts tournament with registered players
     */
    const handle_start_tournament = () =>
    {
        if (players.length < MAX_PLAYERS)
        {
            set_error({ message: "A tournament must contain 2 additional players", type: "error" });
            return;
        }

        on_players_validated(players);
    };


    /**
     * Resets player registration form and data
     */
    const reset_players = () =>
    {
        const logged_in_player = players.find(player => player.user_id === user?.id);

        if (logged_in_player)
        {
            set_players([logged_in_player]);
        }
        else
        {
            set_players([]);
        }

        set_new_player_alias("");
        set_error(null);
    };


    /**
     * Returns the number of players that can still be added
     */
    const get_remaining_slots = () =>
    {
        return MAX_PLAYERS - players.length;
    };


    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Tournament Registration</h2>

            {get_remaining_slots() > 0 ? (
                <PlayerRegistrationForm
                    on_add_player={handle_add_player}
                    players={players}
                    error={error}
                    set_error={set_error}
                    new_player_alias={new_player_alias}
                    set_new_player_alias={set_new_player_alias}
                />
            ) : (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center text-blue-700">
                    Maximum number of players (3) reached.
                </div>
            )}

            <PlayersList players={players} />

            <div className="flex space-x-4">
                <button
                    onClick={handle_start_tournament}
                    disabled={players.length < MAX_PLAYERS}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Start Tournament
                </button>
                <button
                    onClick={reset_players}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};


export default ValidatePlayer;
