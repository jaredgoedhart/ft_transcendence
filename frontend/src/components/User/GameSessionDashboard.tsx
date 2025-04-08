// FRONTEND: frontend/src/components/User/GameSessionDashboard.tsx


import React, { useState, useEffect } from "react";
import { match_api } from "../../services/api";
import { use_authentication } from "../../context/AuthenticationContext";


interface GameSessionDashboardProperties
{
    user_id?: number;
    match_id?: number;
}


interface MatchData
{
    id: number;
    player1_id: number;
    player2_id: number;
    winner_id: number | null;
    player1_score: number;
    player2_score: number;
    game_type: string;
    created_at: string;
}


interface MatchStatistics
{
    average_score: number;
    average_win_margin: number;
    win_streak: number;
    score_percentile: string;
}


/**
 * Displays detailed statistics for game sessions/matches
 */
const GameSessionDashboard: React.FC<GameSessionDashboardProperties> = ({ user_id, match_id }) =>
{
    const { user } = use_authentication();
    const [matches, set_matches] = useState<MatchData[]>([]);
    const [selected_match, set_selected_match] = useState<MatchData | null>(null);
    const [match_statistics, set_match_statistics] = useState<MatchStatistics | null>(null);
    const [loading, set_loading] = useState<boolean>(true);
    const [error, set_error] = useState<string>("");

    const effective_user_id = user_id || user?.id;

    /**
     * Fetches match history data from the API
     */
    useEffect(() =>
    {
        const fetch_match_history = async (): Promise<void> =>
        {
            try
            {
                if (!effective_user_id)
                {
                    set_error("No user selected");
                    set_loading(false);
                    return;
                }

                set_loading(true);

                const response = await match_api.get_history(30, 0);

                const fetched_matches = response.data.matches || [];
                set_matches(fetched_matches);

                if (match_id && fetched_matches.length > 0)
                {
                    const match = fetched_matches.find((m: MatchData) => m.id === match_id);
                    if (match)
                    {
                        set_selected_match(match);
                        const stats = calculate_match_statistics(match, fetched_matches, effective_user_id);
                        set_match_statistics(stats);
                    }
                }

                set_loading(false);
            }
            catch (error)
            {
                console.error("Error fetching match history:", error);
                set_error("Failed to load match history");
                set_loading(false);
            }
        };

        fetch_match_history().catch(error =>
        {
            console.error("Error fetching match history:", error);
        });
    }, [effective_user_id, match_id, user]);

    /**
     * Formats a date string to a more readable format
     */
    const format_date = (date_string: string): string =>
    {
        const date = new Date(date_string);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    /**
     * Determines if the user won the match based on game type
     * For multiplayer matches, we assume player2_score is already the highest opponent score
     */
    const did_user_win = (match: MatchData, user_id: number): boolean =>
    {
        const user_is_player1 = match.player1_id === user_id;

        const user_score = user_is_player1 ? match.player1_score : match.player2_score;
        const opponent_score = user_is_player1 ? match.player2_score : match.player1_score;

        return user_score > opponent_score;
    };

    /**
     * Gets user score and opponent score for display
     */
    const get_match_scores = (match: MatchData, user_id: number): { user_score: number, opponent_score: number } =>
    {
        const user_is_player1 = match.player1_id === user_id;
        const user_score = user_is_player1 ? match.player1_score : match.player2_score;
        const opponent_score = user_is_player1 ? match.player2_score : match.player1_score;

        return { user_score, opponent_score };
    };

    /**
     * Calculates detailed statistics for a specific match
     */
    const calculate_match_statistics = (current_match: MatchData, all_matches: MatchData[], user_id: number): MatchStatistics =>
    {
        const user_scores = all_matches.map(match =>
        {
            const { user_score } = get_match_scores(match, user_id);
            return user_score;
        });

        const average_score = user_scores.reduce((sum, score) => sum + score, 0) / user_scores.length;

        const won_matches = all_matches.filter(match => did_user_win(match, user_id));

        const win_margins = won_matches.map(match =>
        {
            const { user_score, opponent_score } = get_match_scores(match, user_id);
            return user_score - opponent_score;
        });

        const average_win_margin = win_margins.length > 0
            ? win_margins.reduce((sum, margin) => sum + margin, 0) / win_margins.length
            : 0;

        let current_streak = 0;

        const sorted_matches = [...all_matches].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const current_match_index = sorted_matches.findIndex(m => m.id === current_match.id);

        if (current_match_index >= 0)
        {
            const matches_before = sorted_matches.slice(current_match_index + 1);
            const current_match_is_win = did_user_win(current_match, user_id);

            for (const match of matches_before)
            {
                const match_is_win = did_user_win(match, user_id);

                if (match_is_win === current_match_is_win)
                {
                    current_streak++;
                }
                else
                {
                    break;
                }
            }
        }

        const { user_score } = get_match_scores(current_match, user_id);

        const sorted_scores = [...user_scores].sort((a, b) => a - b);

        const scores_below = sorted_scores.filter(score => score < user_score).length;
        const percentile = Math.round((scores_below / sorted_scores.length) * 100);

        let score_percentile = "average";
        if (percentile >= 80)
        {
            score_percentile = "exceptional";
        }
        else if (percentile >= 60)
        {
            score_percentile = "above average";
        }
        else if (percentile <= 20)
        {
            score_percentile = "below average";
        }
        else if (percentile <= 10)
        {
            score_percentile = "poor";
        }

        return {
            average_score,
            average_win_margin,
            win_streak: current_streak,
            score_percentile
        };
    };

    /**
     * Handles selecting a match to view details
     */
    const handle_select_match = (match: MatchData): void =>
    {
        if (!effective_user_id)
            return;

        set_selected_match(match);
        const stats = calculate_match_statistics(match, matches, effective_user_id);
        set_match_statistics(stats);
    };

    /**
     * Returns to match list view
     */
    const handle_back_to_list = (): void =>
    {
        set_selected_match(null);
        set_match_statistics(null);
    };

    if (loading)
    {
        return (
            <div className="text-center py-8">
                <div className="text-gray-600">Loading game sessions...</div>
            </div>
        );
    }

    if (error && matches.length === 0)
    {
        return (
            <div className="text-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (matches.length === 0)
    {
        return (
            <div className="text-center py-8">
                <div className="text-gray-600">No game sessions available</div>
            </div>
        );
    }

    if (selected_match && effective_user_id && match_statistics)
    {
        const { user_score, opponent_score } = get_match_scores(selected_match, effective_user_id);
        const user_won = did_user_win(selected_match, effective_user_id);
        const is_draw = selected_match.winner_id === null;
        const score_margin = user_score - opponent_score;

        return (
            <div className="py-4">
                <div className="mb-4">
                    <button
                        onClick={handle_back_to_list}
                        className="text-blue-500 flex items-center"
                    >
                        ← Back to sessions list
                    </button>
                </div>

                <h2 className="text-xl font-semibold mb-4">Game Session Details</h2>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 font-medium">{format_date(selected_match.created_at)}</span>
                    </div>

                    <div className="mb-4">
                        <span className="text-gray-500">Game Type:</span>
                        <span className="ml-2 font-medium">{selected_match.game_type}</span>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Result</h3>
                        <div className="flex justify-center items-center">
                            <div className="text-center px-6">
                                <div className="text-sm text-gray-500">Your Score</div>
                                <div className="text-2xl font-bold">{user_score}</div>
                            </div>

                            <div className="px-4 text-xl font-bold">vs</div>

                            <div className="text-center px-6">
                                <div className="text-sm text-gray-500">Opponent's Score</div>
                                <div className="text-2xl font-bold">{opponent_score}</div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <span className={`px-3 py-1 rounded-full ${is_draw ? 'bg-gray-200 text-gray-700' : user_won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {is_draw ? 'Draw' : user_won ? 'Victory' : 'Defeat'}
                            </span>
                        </div>
                    </div>

                    {/* Match Statistics Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-3">Match Analysis</h3>

                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Score Comparison */}
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">Score Comparison</div>
                                    <div className="font-medium">
                                        You scored <span className="font-bold">{user_score}</span> points in this match vs. your average of <span className="font-bold">{(match_statistics.average_score / 2).toFixed(1)}/5</span> points
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        This was a {match_statistics.score_percentile} performance compared to your other matches
                                    </div>
                                </div>

                                {/* Win/Loss Margin */}
                                {!is_draw && (
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <div className="text-sm text-gray-500 mb-1">Margin</div>
                                        <div className="font-medium">
                                            {user_won ? (
                                                <>
                                                    Won with a margin of <span className="font-bold">{Math.abs(score_margin)}</span> points vs. your average win margin of <span className="font-bold">{match_statistics.average_win_margin.toFixed(1)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    Lost with a margin of <span className="font-bold">{Math.abs(score_margin)}</span> points
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Historical Context */}
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">Streak</div>
                                    <div className="font-medium">
                                        {match_statistics.win_streak > 0 ? (
                                            <>
                                                This is your <span className="font-bold">{ordinal(match_statistics.win_streak + 1)}</span> consecutive {user_won ? 'victory' : 'defeat'}
                                            </>
                                        ) : (
                                            <>
                                                This {user_won ? 'victory' : 'defeat'} ended a streak of opposite results
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Summary */}
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">Performance</div>
                                    <div className="font-medium">
                                        {getPerformanceDescription(user_score, match_statistics.average_score)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* Otherwise, show the list of game sessions */
    return (
        <div className="py-4">
            <h2 className="text-xl font-semibold mb-6">Game Sessions</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Result</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {matches.map((match) =>
                    {
                        if (!effective_user_id) return null;

                        const { user_score, opponent_score } = get_match_scores(match, effective_user_id);
                        const user_won = did_user_win(match, effective_user_id);
                        const is_draw = match.winner_id === null;

                        return (
                            <tr key={match.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format_date(match.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {match.game_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${is_draw ? 'bg-gray-100 text-gray-800' : user_won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {is_draw ? 'Draw' : user_won ? 'Win' : 'Loss'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user_score} - {opponent_score}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handle_select_match(match)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


/**
 * Helper function to convert a number to its ordinal form (1st, 2nd, 3rd, etc.)
 */
function ordinal(n: number): string
{
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}


/**
 * Helper function to generate performance description based on score
 * @param score - The user's score in this match
 * @param average_user_score - The user's average score across all matches
 */
function getPerformanceDescription(score: number, average_user_score: number): string
{
    const difference = score - average_user_score;

    if (difference > 2)
    {
        return "This was an exceptional performance, scoring significantly above your average.";
    }
    else if (difference > 0.5)
    {
        return "You performed better than usual in this match.";
    }
    else if (difference < -2)
    {
        return "This was below your typical scoring performance.";
    }
    else if (difference < -0.5)
    {
        return "You scored slightly below your average in this match.";
    }
    else
    {
        return "This was a typical performance for you, scoring close to your average.";
    }
}


export default GameSessionDashboard;
