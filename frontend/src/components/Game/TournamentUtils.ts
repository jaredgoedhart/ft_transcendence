/*
frontend/src/components/Game/TournamentUtils.ts

This file contains utility functions for tournament management.
Provides algorithms for creating match pairs, determining winners,
and organizing tournament progression. Handles the logical backbone
of tournament operations.
*/


import { Player, StartMatch } from "./Types";


/**
 * Creëert random paren van spelers voor toernooiwedstrijden
 */
export const create_match_pairs = (players: Player[]): StartMatch[] =>
{
    const available_players = players.filter(player => player.wins < 2);

    const potential_finalists = players.filter(player => player.wins >= 2);

    if (potential_finalists.length >= 2)
    {
        const sorted_finalists = [...potential_finalists].sort((a, b) => b.wins - a.wins);
        const finalists = [sorted_finalists[0], sorted_finalists[1]];

        return [{
            player1: finalists[0],
            player2: finalists[1],
            player1_score: 0,
            player2_score: 0,
            is_complete: false
        }];
    }

    const shuffled_players = [...available_players].sort(() => Math.random() - 0.5);
    const matches: StartMatch[] = [];

    for (let i = 0; i < shuffled_players.length - 1; i += 2)
    {
        matches.push({
            player1: shuffled_players[i],
            player2: shuffled_players[i + 1],
            player1_score: 0,
            player2_score: 0,
            is_complete: false
        });
    }

    if (shuffled_players.length % 2 !== 0)
    {
        const bye_player = shuffled_players[shuffled_players.length - 1];
        console.log(`${bye_player.alias} heeft een bye voor deze ronde`);
    }

    return matches;
};
