/*
frontend/src/components/Game/TournamentSummary.tsx

This file contains the component for displaying tournament overview information.
Shows player statistics, match history, current standings, and tournament
progression controls. Provides a comprehensive view of the tournament's
current state and results.
*/


import React from "react";
import { Player, StartMatch } from "./Types";


interface TournamentSummaryProperties
{
    players: Player[];
    current_matches: StartMatch[];
    current_round: number;
    next_match?: StartMatch;
    on_continue_tournament: () => void;
    tournament_winner?: Player | null;
    is_final_match: boolean;
    should_show_final_message?: boolean;
    toggle_view?: () => void;
    on_tournament_complete: () => void;
    tournament_completed?: boolean;
}


const TournamentSummary: React.FC<TournamentSummaryProperties> = ({
                                                                      players,
                                                                      current_matches,
                                                                      current_round,
                                                                      next_match,
                                                                      on_continue_tournament,
                                                                      tournament_winner,
                                                                      is_final_match,
                                                                      should_show_final_message,
                                                                      on_tournament_complete,
                                                                      tournament_completed = false
                                                                  }) =>
{
    const render_action_buttons = () =>
    {
        if (tournament_winner || tournament_completed)
        {
            return (
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200 mt-4">
                    <h3 className="font-bold mb-2 text-center text-yellow-800">
                        Tournament Winner!
                    </h3>
                    <p className="text-center text-xl">
                        🏆 <span className="font-bold">{tournament_winner?.alias || "Unknown"}</span> 🏆
                    </p>
                    <p className="text-center mt-2">
                        Congratulations on winning the tournament!
                    </p>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={on_tournament_complete}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Start New Tournament
                        </button>
                    </div>
                </div>
            );
        }

        if (should_show_final_message && !tournament_winner && !tournament_completed)
        {
            return (
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200 mt-4">
                    <h3 className="font-bold mb-2 text-center text-yellow-800">
                        Final Match Required!
                    </h3>
                    <p className="text-center">
                        Multiple players have reached 2 or more wins. A final match is needed to determine the champion!
                    </p>

                    {next_match && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => {
                                    on_continue_tournament();
                                }}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                Start Final Match
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (next_match && !tournament_winner && !tournament_completed)
        {
            return (
                <div className="p-4 bg-blue-50 rounded mt-4">
                    <h3 className="font-bold mb-2">Next Match:</h3>
                    <div className="text-center mb-4">
                        <p className="text-lg">
                            <span className="font-semibold">{next_match.player1.alias}</span>
                            {" "}vs{" "}
                            <span className="font-semibold">{next_match.player2.alias}</span>
                        </p>
                        {is_final_match && (
                            <p className="text-sm mt-1 text-blue-600 font-medium">Final Match!</p>
                        )}
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={on_continue_tournament}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Continue Tournament
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tournament Dashboard - Round {current_round}</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="font-bold mb-4">Current Matches:</h3>
                    {current_matches.length > 0 ? (
                        <div className="grid gap-4">
                            {current_matches.map((match, index) => (
                                <div key={index} className="bg-white p-4 rounded border flex justify-between items-center">
                                    <div className="flex-1">
                                        <span className="font-semibold">{match.player1.alias}</span>
                                        <span className="mx-2">vs</span>
                                        <span className="font-semibold">{match.player2.alias}</span>
                                    </div>
                                    {match.is_complete && (
                                        <div className="text-sm text-gray-500">
                                            Completed: {match.player1_score} - {match.player2_score}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No active matches</p>
                    )}
                </div>

                {render_action_buttons()}

                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-bold mb-4">Player Statistics:</h3>
                    <div className="grid gap-2">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className={`bg-white p-3 rounded border flex justify-between items-center 
                                    ${tournament_winner && player.id === tournament_winner.id ? 'border-yellow-400 bg-yellow-50' : ''}`}
                            >
                                <span>{player.alias}</span>
                                <span className="font-semibold">Won: {player.wins}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TournamentSummary;
