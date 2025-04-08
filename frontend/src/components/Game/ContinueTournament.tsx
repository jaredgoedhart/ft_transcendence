/*
frontend/src/components/Game/ContinueTournament.tsx

This file contains the component for managing tournament progression between matches.
Handles displaying the final match screen, providing controls to start the next match,
and coordinating the tournament flow. Integrates with other tournament components
to create a cohesive user experience.
*/


import React, { useState, useEffect } from "react";
import { Player, Match, StartMatch } from "./Types";
import TournamentSummary from "./TournamentSummary";
import FinalTournamentMatch from "./FinalTournamentMatch";


interface ContinueTournamentProperties
{
    last_match?: Match;
    next_match?: StartMatch;
    on_next_match: (player1: Player, player2: Player) => void;
    on_tournament_complete: () => void;
    is_round_complete: boolean;
    current_round: number;
    round_winner?: Player;
    token: string;
    players: Player[];
    current_matches: StartMatch[];
    tournament_winner?: Player | null;
    is_final_match: boolean;
    tournament_completed?: boolean;
    should_show_final_message?: boolean;
}


/**
 * Component for continuing tournament after a match is complete
 */
const ContinueTournament: React.FC<ContinueTournamentProperties> = ({
                                                                        // Ongebruikte parameters uitgezet
                                                                        // last_match,
                                                                        next_match,
                                                                        on_next_match,
                                                                        on_tournament_complete,
                                                                        // is_round_complete,
                                                                        current_round,
                                                                        // round_winner,
                                                                        token,
                                                                        players,
                                                                        current_matches,
                                                                        tournament_winner,
                                                                        is_final_match,
                                                                        tournament_completed = false,
                                                                        // should_show_final_message
                                                                    }) =>
{
    const [showing_final_screen, set_showing_final_screen] = useState<boolean>(false);


    useEffect(() =>
    {
        if (next_match && is_final_match && !showing_final_screen && !tournament_winner && !tournament_completed)
        {
            set_showing_final_screen(true);
        }
    }, [next_match, is_final_match, showing_final_screen, tournament_winner, tournament_completed]);


    /**
     * Validates if the token exists
     */
    const validate_action = (): boolean =>
    {
        if (!token)
        {
            return false;
        }

        return true;
    };


    /**
     * Handles starting the next match
     */
    const handle_next_match = () =>
    {
        if (!validate_action() || !next_match)
            return;

        on_next_match(next_match.player1, next_match.player2);
    };


    /**
     * Handles starting the final match
     */
    const handle_start_final = () =>
    {
        if (!validate_action() || !next_match)
            return;

        set_showing_final_screen(false);
        on_next_match(next_match.player1, next_match.player2);
    };


    /**
     * Handles canceling the final match
     */
    const handle_cancel_final = () =>
    {
        set_showing_final_screen(false);
    };


    if (showing_final_screen && next_match && is_final_match)
    {
        return (
            <FinalTournamentMatch
                player1={next_match.player1}
                player2={next_match.player2}
                on_start_final={handle_start_final}
                on_cancel={handle_cancel_final}
            />
        );
    }


    const should_show_final = players.filter(p => p.wins >= 2).length >= 2 && !tournament_winner;

    return (
        <TournamentSummary
            players={players}
            current_matches={current_matches}
            current_round={current_round}
            next_match={next_match}
            on_continue_tournament={handle_next_match}
            tournament_winner={tournament_winner}
            is_final_match={is_final_match}
            should_show_final_message={should_show_final}
            toggle_view={() => {}}
            on_tournament_complete={on_tournament_complete}
            tournament_completed={tournament_completed}
        />
    );
};


export default ContinueTournament;
