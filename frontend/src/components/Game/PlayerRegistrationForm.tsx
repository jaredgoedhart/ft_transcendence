/*
frontend/src/components/Game/PlayerRegistrationForm.tsx

This file contains the form component for registering players in tournaments.
Validates player names, prevents duplicates, and enforces naming rules.
Serves as the entry point for users joining tournament play.
*/


import React from "react";
import { Player, ValidationError } from "./Types";
import { sanitize_input } from "./InputValidation";


interface PlayerRegistrationFormProperties
{
    on_add_player: (player: Player) => void;
    players: Player[];
    error: ValidationError | null;
    set_error: (error: ValidationError | null) => void;
    new_player_alias: string;
    set_new_player_alias: (alias: string) => void;
}


/**
 * Form component for registering players in tournament
 */
export const PlayerRegistrationForm: React.FC<PlayerRegistrationFormProperties> = ({
                                                                                  on_add_player,
                                                                                  players,
                                                                                  error,
                                                                                  set_error,
                                                                                  new_player_alias,
                                                                                  set_new_player_alias
                                                                              }) =>
{

    /**
     * Validates player alias against requirements
     */
    const validate_player_alias = (alias: string): boolean =>
    {
        const trimmed_alias = sanitize_input(alias.trim());

        if (!trimmed_alias)
        {
            set_error({ message: "Enter a name", type: "error" });
            return false;
        }

        if (trimmed_alias.length < 2)
        {
            set_error({ message: "Name must be at least 2 characters long", type: "error" });
            return false;
        }

        if (trimmed_alias.length > 15)
        {
            set_error({ message: "Name can be maximum 15 characters long", type: "error" });
            return false;
        }

        if (players.some(player => player.alias.toLowerCase() === trimmed_alias.toLowerCase()))
        {
            set_error({ message: "This name is already in use", type: "error" });
            return false;
        }

        if (!/^[a-zA-Z0-9-_]+$/.test(trimmed_alias))
        {
            set_error({ message: "Name can only contain letters, numbers, - and _", type: "error" });
            return false;
        }

        return true;
    };


    /**
     * Handles adding a new player
     */
    const handle_add_player = () =>
    {
        if (!validate_player_alias(new_player_alias))
        {
            return;
        }

        const new_player: Player =
        {
            id: Date.now().toString(),
            alias: new_player_alias.trim(),
            wins: 0
        };

        on_add_player(new_player);
        set_new_player_alias("");
        set_error(null);
    };


    /**
     * Handles key press events for form submission
     */
    const handle_key_down = (event: React.KeyboardEvent) =>
    {
        if (event.key === "Enter")
        {
            handle_add_player();
        }
    };


    return (
        <div className="mb-6">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={new_player_alias}
                    onChange={(e) => set_new_player_alias(e.target.value)}
                    onKeyDown={handle_key_down}
                    placeholder="Enter player name"
                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={15}
                />
                <button
                    onClick={handle_add_player}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Add
                </button>
            </div>

            {error && (
                <div className={`mt-2 text-sm ${error.type === "error" ? "text-red-500" : "text-yellow-500"}`}>
                    {error.message}
                </div>
            )}
        </div>
    );
};
