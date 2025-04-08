/*
frontend/src/components/Game/Match.tsx

This file contains the component for displaying individual match information.
Shows player names, match status, and provides controls to start matches.
Used within tournament interfaces to represent current and upcoming games.
*/


import React from "react";
import { StartMatch } from "./Types";
import { use_authentication } from "../../context/AuthenticationContext";


interface MatchProperties
{
    match: StartMatch;
    on_start_match: (match: StartMatch) => void;
}


/**
 * Renders a single match with player names and start button
 */
export const Match: React.FC<MatchProperties> = ({ match, on_start_match }) =>
{
    const { user } = use_authentication();

    return (
        <div className="bg-white p-4 rounded border flex justify-between items-center">
            <div className="flex-1">
                <span className={`font-semibold ${user && match.player1.alias === user.display_name ? "text-blue-600" : ""}`}>
                    {match.player1.alias}
                </span>
                <span className="mx-2">vs</span>
                <span className={`font-semibold ${user && match.player2.alias === user.display_name ? "text-blue-600" : ""}`}>
                    {match.player2.alias}
                </span>
            </div>
            {!match.is_complete && (
                <button
                    onClick={() => on_start_match(match)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Start Match
                </button>
            )}
        </div>
    );
};
