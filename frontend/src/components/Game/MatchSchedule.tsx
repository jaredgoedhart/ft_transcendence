/*
frontend/src/components/Game/MatchSchedule.tsx

This file contains the component for displaying the tournament match schedule.
Renders a list of current and upcoming matches with player information
and match controls. Helps players track tournament progress and navigate
between matches.
*/


import React from "react";
import { StartMatch } from "./Types";
import { Match } from "./Match";


interface MatchScheduleProperties
{
    matches: StartMatch[];
    on_start_match: (match: StartMatch) => void;
}


/**
 * Displays a schedule of all matches
 */
export const MatchSchedule: React.FC<MatchScheduleProperties> = ({ matches, on_start_match }) =>
{
    /**
     * Renders match list or empty state message based on available matches
     */
    const render_match_content = () =>
    {
        if (matches.length > 0)
        {
            return (
                <div className="grid gap-4">
                    {matches.map((match, index) => (
                        <Match
                            key={index}
                            match={match}
                            on_start_match={on_start_match}
                        />
                    ))}
                </div>
            );
        }
        else
        {
            return (
                <p className="text-gray-500 text-center">No active matches</p>
            );
        }
    };


    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-4">Current Matches:</h3>
            {render_match_content()}
        </div>
    );
};
