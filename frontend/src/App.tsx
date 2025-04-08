/**
 * FRONTEND: frontend/src/App.tsx
 *
 * Main application component managing routing, authentication,
 * and game state for the Pong Tournament application.
 *
 * Handles user navigation, game modes, and tournament logic.
 */


import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { use_authentication } from "./context/AuthenticationContext";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import UserProfile from "./components/User/UserProfile";
import FriendsList from "./components/User/FriendsList";
import ValidatePlayer from "./components/Game/ValidatePlayer";
import StartTournament from "./components/Game/StartTournament";
import RenderGame from "./components/Game/RenderGame";
import ContinueTournament from "./components/Game/ContinueTournament";
import DirectMatch from "./components/Game/DirectMatch";
import MultiplayerGame from "./components/Game/MultiplayerGame";
import { Player, Match, GameState, StartMatch, GameMode } from "./components/Game/Types";
import { generate_game_token } from "./components/Game/TokenValidation";
import { match_api } from "./services/api";


/**
 * Main application component with routing
 */
const App = () =>
{
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
};


/**
 * Main application content with routing logic
 */
const AppContent = () =>
{
    const { is_authenticated, user, loading, logout } = use_authentication();
    const navigate = useNavigate();
    const location = useLocation();

    const [game_state, set_game_state] = useState<GameState>('VALIDATING');
    const [players, set_players] = useState<Player[]>([]);
    const [current_match, set_current_match] = useState<Match | null>(null);
    const [last_match, set_last_match] = useState<Match | null>(null);
    const [next_match, set_next_match] = useState<Match | null>(null);
    const [current_round, set_current_round] = useState<number>(0);
    const [round_winner, set_round_winner] = useState<Player | undefined>(undefined);
    const [is_round_complete, set_is_round_complete] = useState<boolean>(false);
    const [game_token, set_game_token] = useState<string>(generate_game_token());
    const [is_match_saving, set_is_match_saving] = useState<boolean>(false);
    const [completed_matches, set_completed_matches] = useState<StartMatch[]>([]);
    const [is_final_match, set_is_final_match] = useState<boolean>(false);
    const [tournament_winner, set_tournament_winner] = useState<Player | null>(null);
    const [_show_final_screen, set_show_final_screen] = useState<boolean>(false);
    const [tournament_completed, set_tournament_completed] = useState<boolean>(false);
    const [current_game_type, set_current_game_type] = useState<GameMode>('TOURNAMENT');


    /**
     * Handle login success by redirecting to profile
     */
    const handle_login_success = () =>
    {
        navigate("/profile");
    };


    /**
     * Handle register success by redirecting to log in
     */
    const handle_register_success = () =>
    {
        navigate("/login");
    };


    /**
     * Handle selecting a friend to view profile
     */
    const handle_select_friend = (friend: any) =>
    {
        navigate(`/profile/${friend.id}`);
    };


    /**
     * Handle validation of players for tournament
     */
    const handle_players_validated = (validated_players: Player[]) =>
    {
        if (!game_token)
            return;

        set_players(validated_players);
        set_game_state('TOURNAMENT_START');
    };


    /**
     * Start a match between two players
     */
    const handle_start_match = (player1: Player, player2: Player) =>
    {
        if (!game_token || tournament_completed || tournament_winner !== null)
            return;

        if (user && player2.user_id === user.id)
        {
            const temp_player = player1;
            player1 = player2;
            player2 = temp_player;
        }

        const new_match = {player1, player2, is_complete: false, token: game_token};

        set_current_match(new_match);
        set_game_state('PLAYING');
        set_current_round(current_round + 1);
    };


    /**
     * Save tournament match results to the database
     */
    const save_tournament_match = (player1: Player, player2: Player, score: {left: number, right: number}, winner: Player): void =>
    {
        if (!user) return;

        const is_user_involved =
            (player1.user_id === user.id) ||
            (player2.user_id === user.id);

        if (!is_user_involved) return;

        if (is_match_saving) return;

        set_is_match_saving(true);

        const opponent_id = 1;

        const player1_score = score.left;
        const player2_score = score.right;

        const winner_is_player1 = player1.id === winner.id;
        const final_p1_score = winner_is_player1 ? Math.max(player1_score, player2_score) : Math.min(player1_score, player2_score);
        const final_p2_score = winner_is_player1 ? Math.min(player1_score, player2_score) : Math.max(player1_score, player2_score);

        match_api.create_match(opponent_id, "Tournament")
            .then(response => {
                const match_id = response.data.match.id;
                return match_api.update_match_result(match_id, final_p1_score, final_p2_score);
            })
            .then(() =>
            {
                /* MATCH SAVES SUCCESSFULLY */
            })
            .catch((_error) =>
            {
                console.error('Error saving tournament match');
            })
            .finally(() =>
            {
                set_is_match_saving(false);
            });
    };


    /**
     * Determine tournament status based on player wins
     */
    const determine_tournament_status = (playersList = players) =>
    {
        if (tournament_winner !== null || tournament_completed)
        {
            return {
                has_winner: true,
                needs_final: false,
                winner: tournament_winner,
                finalists: null
            };
        }

        if (is_final_match && last_match && last_match.winner)
        {
            return {
                has_winner: true,
                needs_final: false,
                winner: last_match.winner,
                finalists: null
            };
        }

        const players_with_two_wins = playersList.filter(p => p.wins >= 2);

        if (players_with_two_wins.length >= 2 && !is_final_match && !tournament_winner && !tournament_completed)
        {
            const sorted_players = [...players_with_two_wins].sort((a, b) => b.wins - a.wins);
            const finalists = sorted_players.slice(0, 2);

            return {
                has_winner: false,
                needs_final: true,
                finalists: finalists,
                winner: null
            };
        }

        if (players_with_two_wins.length === 1)
        {
            const remaining_players = playersList.filter(p => p.wins < 2);

            if (remaining_players.length > 0)
            {
                return {
                    has_winner: false,
                    needs_final: false,
                    winner: null,
                    finalists: null
                };
            }

            return {
                has_winner: true,
                needs_final: false,
                winner: players_with_two_wins[0],
                finalists: null
            };
        }

        return {
            has_winner: false,
            needs_final: false,
            winner: null,
            finalists: null
        };
    };


    /**
     * Handle game completion and update tournament state
     */
    const handle_game_complete = (winner: Player, score: {left: number, right: number, bottom?: number}) =>
    {
        if (!current_match || current_match.token !== game_token || tournament_completed || tournament_winner !== null)
            return;

        const updated_match =
        {
            ...current_match,
            winner,
            is_complete: true,
            player1_score: score.left,
            player2_score: score.right
        };

        set_last_match(updated_match);
        set_round_winner(winner);

        set_completed_matches(prev_matches => [
            ...prev_matches,
            {
                player1: updated_match.player1,
                player2: updated_match.player2,
                player1_score: score.left,
                player2_score: score.right,
                is_complete: true,
                winner: winner
            }
        ]);

        if (is_final_match)
        {
            const updated_players = players.map(player =>
                player.id === winner.id ? { ...player, wins: player.wins + 1 } : player
            );
            set_players(updated_players);

            set_tournament_winner(winner);
            set_tournament_completed(true);
            set_is_round_complete(true);
            set_next_match(null);
            set_is_final_match(false);

            save_tournament_match(
                current_match.player1,
                current_match.player2,
                score,
                winner
            );

            set_current_match(null);
            set_game_state('CONTINUE');
            return;
        }

        const updated_players = players.map(player =>
            player.id === winner.id ? { ...player, wins: player.wins + 1 } : player
        );

        set_players(updated_players);

        const tournament_status = determine_tournament_status(updated_players);

        if (tournament_status.has_winner)
        {
            set_tournament_winner(tournament_status.winner);
            set_tournament_completed(true);
            set_is_round_complete(true);
            set_next_match(null);
            set_is_final_match(false);
        }
        else if (tournament_status.needs_final && tournament_status.finalists && !tournament_winner && !tournament_completed)
        {
            const final_match =
            {
                player1: tournament_status.finalists[0],
                player2: tournament_status.finalists[1],
                is_complete: false,
                token: game_token
            };

            set_is_final_match(true);
            set_next_match(final_match);
            set_is_round_complete(false);

            set_current_round(prev => prev + 1);
        }
        else if (!tournament_winner && !tournament_completed)
        {
            const remaining_players = updated_players.filter(p => p.wins < 2);

            if (remaining_players.length >= 2)
            {
                const match_counts: {[key: string]: number} = {};

                updated_players.forEach(player =>
                {
                    const played = completed_matches.filter(
                        match => match.player1.id === player.id || match.player2.id === player.id
                    ).length;

                    match_counts[player.id] = played;
                });

                const sorted_by_play_count = [...remaining_players].sort(
                    (a, b) => (match_counts[a.id] || 0) - (match_counts[b.id] || 0)
                );

                const next_pair = sorted_by_play_count.slice(0, 2);

                if (match_counts[next_pair[0].id] === match_counts[next_pair[1].id] && Math.random() > 0.5)
                {
                    [next_pair[0], next_pair[1]] = [next_pair[1], next_pair[0]];
                }

                const new_next_match =
                {
                    player1: next_pair[0],
                    player2: next_pair[1],
                    is_complete: false,
                    token: game_token
                };

                set_next_match(new_next_match);
                set_is_round_complete(false);
            }
            else
            {
                set_is_round_complete(true);
                set_next_match(null);
            }
        }

        save_tournament_match(
            current_match.player1,
            current_match.player2,
            score,
            winner
        );

        set_current_match(null);
        set_game_state('CONTINUE');
    };


    /**
     * End tournament and reset state
     */
    const handle_end_tournament = () =>
    {
        if (!game_token)
            return;

        set_game_token(generate_game_token());
        set_game_state('VALIDATING');
        set_players([]);
        set_current_match(null);
        set_last_match(null);
        set_next_match(null);
        set_current_round(0);
        set_round_winner(undefined);
        set_is_round_complete(false);
        set_completed_matches([]);
        set_is_final_match(false);
        set_tournament_winner(null);
        set_show_final_screen(false);
        set_tournament_completed(false);
    };


    /**
     * Handle logout and redirect to login page
     */
    const handle_logout = () =>
    {
        logout();
        navigate("/login");
    };


    /**
     * Render game screen based on current game state
     */
    const render_game_screen = () =>
    {
        const game_type_selector = (
            <div className="mb-6 flex space-x-4 justify-center">
                <button
                    onClick={() =>
                    {
                        set_current_game_type('TOURNAMENT');
                        navigate("/game/tournament");
                    }}
                    className={`px-4 py-2 rounded ${current_game_type === 'TOURNAMENT' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Tournament Mode
                </button>
                <button
                    onClick={() =>
                    {
                        set_current_game_type('DIRECT_MATCH');
                        navigate("/game/direct-match");
                    }}
                    className={`px-4 py-2 rounded ${current_game_type === 'DIRECT_MATCH' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    1v1 Match
                </button>
                <button
                    onClick={() =>
                    {
                        set_current_game_type('MULTIPLAYER');
                        navigate("/game/multiplayer");
                    }}
                    className={`px-4 py-2 rounded ${current_game_type === 'MULTIPLAYER' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    3-Player Mode
                </button>
            </div>
        );

        if (current_game_type === 'DIRECT_MATCH')
        {
            return (
                <div>
                    {game_type_selector}
                    <DirectMatch />
                </div>
            );
        }

        if (current_game_type === 'MULTIPLAYER')
        {
            return (
                <div>
                    {game_type_selector}
                    <MultiplayerGame />
                </div>
            );
        }

        return (
            <div>
                {game_type_selector}
                {game_state === 'VALIDATING' && (
                    <ValidatePlayer on_players_validated={handle_players_validated} />
                )}

                {game_state === 'TOURNAMENT_START' && (
                    <StartTournament
                        players={players}
                        on_start_match={handle_start_match}
                        on_end_tournament={handle_end_tournament}
                        current_round={current_round}
                    />
                )}

                {game_state === 'PLAYING' && current_match && current_match.token === game_token && (
                    <RenderGame
                        player1={current_match.player1}
                        player2={current_match.player2}
                        on_game_complete={handle_game_complete}
                        token={game_token}
                        game_type="Tournament"
                    />
                )}

                {game_state === 'CONTINUE' && (
                    <ContinueTournament
                        last_match={last_match || undefined}
                        next_match={next_match ? {
                            player1: next_match.player1,
                            player2: next_match.player2,
                            player1_score: 0,
                            player2_score: 0,
                            is_complete: next_match.is_complete,
                            winner: next_match.winner
                        } : undefined}
                        on_next_match={handle_start_match}
                        on_tournament_complete={handle_end_tournament}
                        is_round_complete={is_round_complete}
                        current_round={current_round}
                        round_winner={round_winner}
                        token={game_token}
                        players={players}
                        current_matches={completed_matches}
                        tournament_winner={tournament_winner}
                        is_final_match={is_final_match}
                        tournament_completed={tournament_completed}
                        should_show_final_message={players.filter(p => p.wins >= 2).length >= 2 && !tournament_winner}
                    />
                )}
            </div>
        );
    };


    /**
     * Set game mode when location changes
     */
    useEffect(() =>
    {
        const path = location.pathname;

        if (path.includes("/game/direct-match"))
        {
            set_current_game_type('DIRECT_MATCH');
        }
        else if (path.includes("/game/multiplayer"))
        {
            set_current_game_type('MULTIPLAYER');
        }
        else if (path.includes("/game"))
        {
            set_current_game_type('TOURNAMENT');
        }
    }, [location]);


    /**
     * Redirect unauthenticated users to login
     */
    useEffect(() =>
    {
        if (!loading && !is_authenticated &&
            !location.pathname.includes("/login") &&
            !location.pathname.includes("/register"))
        {
            navigate("/login");
        }
    }, [is_authenticated, loading, location, navigate]);


    /**
     * Render loading state
     */
    if (loading)
    {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-blue-600">Pong Tournament</h1>
                            </div>
                            {is_authenticated && (
                                <div className="ml-6 flex space-x-8">
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className={`${
                                            location.pathname === '/profile'
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => navigate("/friends")}
                                        className={`${
                                            location.pathname === '/friends'
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        Friends
                                    </button>
                                    <button
                                        onClick={() => navigate("/game")}
                                        className={`${
                                            location.pathname.includes('/game')
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        Play Game
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            {is_authenticated && user && (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 hover:bg-gray-200 transition-colors mr-4"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.display_name}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handle_logout}
                                        className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={
                            is_authenticated ?
                                <Navigate to="/profile" replace /> :
                                <div className="py-8">
                                    <LoginForm on_login_success={handle_login_success} />
                                    <div className="mt-4 text-center">
                                        Don't have an account?{" "}
                                        <button
                                            onClick={() => navigate("/register")}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                        } />

                        <Route path="/register" element={
                            is_authenticated ?
                                <Navigate to="/profile" replace /> :
                                <div className="py-8">
                                    <RegisterForm on_register_success={handle_register_success} />
                                    <div className="mt-4 text-center">
                                        Already have an account?{" "}
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Login
                                        </button>
                                    </div>
                                </div>
                        } />

                        {/* Protected routes */}
                        <Route path="/profile" element={
                            <UserProfile />
                        } />

                        <Route path="/profile/:userId" element={
                            <ProfileWithParams />
                        } />

                        <Route path="/friends" element={
                            <FriendsList on_select_friend={handle_select_friend} />
                        } />

                        <Route path="/game" element={
                            render_game_screen()
                        } />

                        <Route path="/game/tournament" element={
                            render_game_screen()
                        } />

                        <Route path="/game/direct-match" element={
                            render_game_screen()
                        } />

                        <Route path="/game/multiplayer" element={
                            render_game_screen()
                        } />

                        {/* Default redirect */}
                        <Route path="*" element={
                            is_authenticated ?
                                <Navigate to="/profile" replace /> :
                                <Navigate to="/login" replace />
                        } />
                    </Routes>
                </div>
            </div>
        </div>
    );
};


/**
 * Profile component that gets user ID from URL parameters
 */
const ProfileWithParams = () =>
{
    const { userId } = useParams();
    return <UserProfile user_id={userId ? parseInt(userId, 10) : undefined} />;
};


export default App;
