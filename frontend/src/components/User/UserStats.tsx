/*
frontend/src/components/User/UserStats.tsx

This file contains the UserStats component, which displays a user's game statistics.
This includes total matches, wins, losses, win rate, and average score.
It also visualizes performance trends, win/loss distribution, and score margins using charts.
*/


import React, { useState, useEffect } from "react";
import { match_api } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';


interface UserStatsProperties
{
    user_id: number;
}


interface StatisticsData
{
    total_matches: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_score: number;
}


/**
 * Component for displaying user game statistics with visualizations
 */
const UserStats: React.FC<UserStatsProperties> = ({ user_id }) =>
{
    const [statistics, set_statistics] = useState<StatisticsData | null>(null);
    const [match_history, set_match_history] = useState<any[]>([]);
    const [loading, set_loading] = useState<boolean>(true);
    const [error, set_error] = useState<string>("");
    const [active_tab, set_active_tab] = useState<string>("overview");

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


    /**
     * Fetches user statistics data from the API
     */
    useEffect(() =>
    {
        const fetch_statistics = async (): Promise<void> =>
        {
            try
            {
                set_loading(true);
                const response = await match_api.get_statistics();
                set_statistics(response.data.statistics);

                const history_response = await match_api.get_history(30, 0);
                set_match_history(history_response.data.matches || []);

                set_loading(false);
            }
            catch (error)
            {
                console.error("Error fetching statistics:", error);
                set_error("Failed to load statistics");
                set_loading(false);
            }
        };

        fetch_statistics().catch((error) =>
        {
            console.error("Statistics fetch error:", error);
            set_error("Failed to load statistics");
            set_loading(false);
        });
    }, [user_id]);


    /**
     * Prepares data for win/loss pie chart
     */
    const prepare_win_loss_data = () =>
    {
        if (!statistics)
            return [];

        return [
            { name: "Wins", value: statistics.wins },
            { name: "Losses", value: statistics.losses }
        ];
    };


    /**
     * Processes match history data for time series visualization
     */
    const prepare_performance_trend_data = () =>
    {
        if (!match_history || match_history.length === 0)
            return [];

        const trend_data = [];
        let running_wins = 0;
        let running_matches = 0;

        const sorted_matches = [...match_history].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        for (const match of sorted_matches)
        {
            running_matches++;
            const is_winner = match.player1_score > match.player2_score;

            if (is_winner)
                running_wins++;

            const current_win_rate = (running_wins / running_matches) * 100;

            trend_data.push({
                match: running_matches,
                win_rate: parseFloat(current_win_rate.toFixed(1)),
                date: new Date(match.created_at).toLocaleDateString()
            });
        }

        return trend_data;
    };


    /**
     * Prepares data for score margin analysis
     */
    const prepare_margin_data = () =>
    {
        if (!match_history || match_history.length === 0)
            return [];


        const margin_categories =
        [
            { margin_type: "Decisive Win", count: 0 },
            { margin_type: "Close Win", count: 0 },
            { margin_type: "Close Loss", count: 0 },
            { margin_type: "Decisive Loss", count: 0 }
        ];


        match_history.forEach(match =>
        {
            const user_is_player1 = match.player1_id === user_id;
            const user_score = user_is_player1 ? match.player1_score : match.player2_score;
            const opponent_score = user_is_player1 ? match.player2_score : match.player1_score;

            const margin = user_score - opponent_score;

            if (margin > 2)
            {
                margin_categories[0].count++;
            }
            else if (margin > 0)
            {
                margin_categories[1].count++;
            }
            else if (margin >= -2)
            {
                margin_categories[2].count++;
            }
            else
            {
                margin_categories[3].count++;
            }
        });

        return margin_categories;
    };

    if (loading)
    {
        return (
            <div className="text-center py-8">
                <div className="text-gray-600">Loading statistics...</div>
            </div>
        );
    }

    if (error)
    {
        return (
            <div className="text-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!statistics)
    {
        return (
            <div className="text-center py-8">
                <div className="text-gray-600">No statistics available</div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <h2 className="text-xl font-semibold mb-6">Game Statistics</h2>

            {/* Tab Navigation */}
            <div className="mb-6 flex border-b">
                <button
                    onClick={() => set_active_tab("overview")}
                    className={`px-4 py-2 ${active_tab === "overview" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => set_active_tab("performance")}
                    className={`px-4 py-2 ${active_tab === "performance" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                >
                    Performance Trend
                </button>
                <button
                    onClick={() => set_active_tab("margins")}
                    className={`px-4 py-2 ${active_tab === "margins" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                >
                    Score Margins
                </button>
            </div>

            {/* Overview Tab */}
            {active_tab === "overview" && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <div className="text-gray-500 text-sm">Total Matches</div>
                            <div className="text-2xl font-bold">{statistics.total_matches}</div>
                        </div>

                        <div className="bg-white p-4 rounded shadow-sm border">
                            <div className="text-gray-500 text-sm">Wins</div>
                            <div className="text-2xl font-bold text-green-600">{statistics.wins}</div>
                        </div>

                        <div className="bg-white p-4 rounded shadow-sm border">
                            <div className="text-gray-500 text-sm">Losses</div>
                            <div className="text-2xl font-bold text-red-600">{statistics.losses}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <div className="text-gray-500 text-sm">Win Rate</div>
                            <div className="text-2xl font-bold">
                                {statistics.win_rate.toFixed(1)}%
                            </div>

                            <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${Math.min(statistics.win_rate, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow-sm border">
                            <div className="text-gray-500 text-sm">Average Score</div>
                            <div className="text-2xl font-bold">{(statistics.avg_score / 2).toFixed(1)}/5</div>
                        </div>
                    </div>

                    {/* Win/Loss Pie Chart */}
                    <div className="mt-6 bg-white p-4 rounded shadow-sm border">
                        <h3 className="text-lg font-medium mb-2">Win/Loss Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={prepare_win_loss_data()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {prepare_win_loss_data().map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* Performance Trend Tab */}
            {active_tab === "performance" && (
                <div className="bg-white p-4 rounded shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Win Rate Over Time</h3>
                    <div className="h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={prepare_performance_trend_data()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="match" label={{ value: 'Match Number', position: 'insideBottomRight', offset: -10 }} />
                                <YAxis label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip formatter={(value) => [`${value}%`, 'Win Rate']} labelFormatter={(label) => `Match ${label}`} wrapperStyle={{ zIndex: 100 }} />
                                <Line type="monotone" dataKey="win_rate" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        This chart shows how your win rate has changed over time as you've played more matches.
                    </p>
                </div>
            )}

            {/* Score Margin Analysis Tab */}
            {active_tab === "margins" && (
                <div className="bg-white p-4 rounded shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Score Margin Analysis</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={prepare_margin_data()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="margin_type" />
                                <YAxis
                                    label={{
                                        value: 'Number of Matches',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { textAnchor: 'middle' },
                                        offset: -5
                                    }}
                                />
                                <Tooltip wrapperStyle={{ zIndex: 100 }} />
                                <Bar dataKey="count" name="Matches">
                                    {prepare_margin_data().map((entry, index) => {
                                        let color = "#8884d8";

                                        if (entry.margin_type === "Close Win" || entry.margin_type === "Close Loss")
                                            color = "#FFB347"; // Orange for close games
                                        else if (entry.margin_type === "Decisive Win")
                                            color = "#82ca9d"; // Green for big wins
                                        else if (entry.margin_type === "Decisive Loss")
                                            color = "#ff7373"; // Red for big losses

                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        This chart analyzes the margin of victory or defeat in your matches. Close games are decided by 2 or fewer points,
                        while decisive games have a larger point differential.
                    </p>
                </div>
            )}
        </div>
    );
};


export default UserStats;
