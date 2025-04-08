/*
frontend/src/components/Game/StartTournament.tsx

This file contains the component for initiating and managing tournaments.
Displays the tournament dashboard with player statistics, match scheduling,
and controls for starting matches or ending tournaments. Serves as the
central hub for tournament coordination.
*/


import React, { useState, useEffect } from "react";
import { Player, StartMatch } from "./Types";
import { MatchSchedule } from "./MatchSchedule";
import { create_match_pairs } from "./TournamentUtils";
import { use_authentication } from "../../context/AuthenticationContext";


interface StartTournamentProperties
{
    players: Player[];
    on_start_match: (player1: Player, player2: Player) => void;
    on_end_tournament: () => void;
    current_round: number;
}


/**
 * Manages tournament dashboard with match schedule
 */
const StartTournament: React.FC<StartTournamentProperties> = ({
                                                                  players,
                                                                  on_start_match,
                                                                  on_end_tournament,
                                                                  current_round
                                                              }) =>
{
    const { user } = use_authentication();
    const [current_matches, set_current_matches] = useState<StartMatch[]>([]);
    const [last_wins_count, set_last_wins_count] = useState<number>(0);

    /**
     * Processes the start of a match and marks it as completed
     */
    const handle_start_match = (match: StartMatch) =>
    {
        if (match.is_complete)
        {
            console.log("Deze wedstrijd is al gespeeld");
            return;
        }

        let match_player1 = match.player1;
        let match_player2 = match.player2;

        const player1_with_user_id =
        {
            ...match_player1,
            user_id: user && match_player1.alias === user.display_name ? user.id : undefined
        };

        const player2_with_user_id =
        {
            ...match_player2,
            user_id: user && match_player2.alias === user.display_name ? user.id : undefined
        };

        let final_player1 = player1_with_user_id;
        let final_player2 = player2_with_user_id;

        if (user && player2_with_user_id.user_id === user.id)
        {
            console.log("Logged in user was right, positions are swapped");
            final_player1 = player2_with_user_id;
            final_player2 = player1_with_user_id;
        }

        const updated_matches = current_matches.map(current_match =>
        {
            if (current_match.player1.id === match.player1.id &&
                current_match.player2.id === match.player2.id)
            {
                return { ...current_match, is_complete: true };
            }
            return current_match;
        });

        set_current_matches(updated_matches);
        on_start_match(final_player1, final_player2);
    };

    /**
     * Ends the tournament after confirmation
     */
    const handle_end_tournament = () =>
    {
        if (window.confirm("Are you sure you want to end the tournament? This cannot be undone."))
        {
            on_end_tournament();
        }
    };

    /**
     * Updating match pairs when number of wins changes
     */
    useEffect(() =>
    {
        const current_wins_count = players.reduce((sum, player) => sum + player.wins, 0);

        if (current_wins_count !== last_wins_count)
        {
            set_last_wins_count(current_wins_count);

            const players_with_two_wins = players.filter(player => player.wins >= 2);

            if (players_with_two_wins.length >= 2)
            {
                const sorted_winners = [...players_with_two_wins].sort((a, b) => b.wins - a.wins);
                const finalists = [sorted_winners[0], sorted_winners[1]];

                const final_matches: StartMatch[] = [{
                    player1: finalists[0],
                    player2: finalists[1],
                    player1_score: 0,
                    player2_score: 0,
                    is_complete: false,
                    winner: undefined
                }];

                set_current_matches(final_matches);
                console.log("Finale wedstrijd ingesteld tussen:", finalists[0].alias, "en", finalists[1].alias);
            }
            else
            {
                const new_matches = create_match_pairs(players);
                set_current_matches(new_matches);

                if (new_matches.length === 0 && players_with_two_wins.length === 1)
                {
                    console.log("Tournament winner without final:", players_with_two_wins[0].alias);
                }
            }
        }
    }, [players, last_wins_count]);

    /**
     * Create initial match pairs on first render
     */
    useEffect(() =>
    {
        if (current_matches.length === 0)
        {
            set_current_matches(create_match_pairs(players));
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tournament Dashboard - Round {current_round}</h2>
                <button
                    onClick={handle_end_tournament}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                    End Tournament
                </button>
            </div>

            <div className="space-y-6">
                <MatchSchedule
                    matches={current_matches}
                    on_start_match={handle_start_match}
                />

                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-bold mb-4">Player Statistics:</h3>
                    <div className="grid gap-2">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="bg-white p-3 rounded border flex justify-between items-center"
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


export default StartTournament;
