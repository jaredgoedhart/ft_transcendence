/*
frontend/src/components/Game/PlayersList.tsx

This file contains the component for displaying registered tournament players.
Renders a list of players who have signed up for the current tournament.
Provides a clear overview of tournament participants before gameplay begins.
*/


import React from "react";
import { Player } from "./Types";


interface PlayersListProperties
{
    players: Player[];
}


/**
 * Displays a list of registered players
 */
export const PlayersList: React.FC<PlayersListProperties> = ({ players }) =>
{
    let players_content;

    if (players.length > 0)
    {
        players_content = (
            <ul className="divide-y">
                {players.map(player => (
                    <li key={player.id} className="py-2 flex justify-between items-center">
                        <span>{player.alias}</span>
                    </li>
                ))}
            </ul>
        );
    }
    else
    {
        players_content = (
            <p className="text-gray-500 text-center">No players registered yet</p>
        );
    }

    return (
        <div className="mb-6">
            <h3 className="font-bold mb-2">Registered Players ({players.length}):</h3>
            {players_content}
        </div>
    );
};
