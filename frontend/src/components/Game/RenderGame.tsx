/*
frontend/src/components/Game/RenderGame.tsx

This file contains the main game canvas rendering component.
Manages game loop, paddle controls, ball physics, collision detection,
scoring, and game state updates. Provides the core visual and interactive
gameplay experience for all game modes.
*/


import { useEffect, useRef, useState, useCallback } from 'react';
import { Player, Score, GameStateReference } from './Types';
import { validate_token } from './TokenValidation';
import * as GameLogic from './GameLogic';
import { create_keyboard_handlers } from './KeyboardControls';
import GameControls from './GameControls';
import { ScoreDisplay } from './ScoreDisplay';


interface RenderGameProperties
{
    player1: Player;
    player2: Player;
    player3?: Player;
    on_game_complete: (winner: Player, score: {left: number, right: number, bottom?: number}) => void;
    token: string;
    game_type?: string;
    is_multiplayer?: boolean;
}


/**
 * Renders the Pong game with canvas and controls
 */
const RenderGame = ({
                        player1,
                        player2,
                        player3,
                        on_game_complete,
                        token,
                        is_multiplayer = false
                    }: RenderGameProperties) =>
{
    const canvas_ref = useRef<HTMLCanvasElement | null>(null);
    const [game_started, set_game_started] = useState<boolean>(false);
    const [is_paused, set_is_paused] = useState<boolean>(false);
    const [score, set_score] = useState<Score>(is_multiplayer
        ? { left: 0, right: 0, bottom: 0 }
        : { left: 0, right: 0 });
    const game_completed = useRef<boolean>(false);
    const animation_ref = useRef<number | null>(null);

    const game_state = useRef<GameStateReference>(GameLogic.initialize_game_state(token, is_multiplayer));
    const keyboard_handlers = useRef<{
        process_keyboard_input: () => void;
    }>({ process_keyboard_input: () => {} });


    /**
     * Validates token before game actions
     */
    const validate_game_action = (): boolean =>
    {
        const is_valid = validate_token(token);

        if (!is_valid)
        {
            set_game_started(false);
            set_is_paused(true);
        }

        return is_valid;
    };


    /**
     * Resets the ball to center position
     */
    const reset_ball = () =>
    {
        if (!validate_game_action())
            return;

        GameLogic.reset_ball(game_state.current);
    };


    /**
     * Renders the game elements on canvas
     */
    const render_game = useCallback((ping_pong_game: CanvasRenderingContext2D) =>
    {
        if (!validate_game_action())
            return;

        /* CLEAR CANVAS */
        ping_pong_game.fillStyle = "black";
        ping_pong_game.fillRect(0, 0, GameLogic.CANVAS_WIDTH, GameLogic.CANVAS_HEIGHT);

        /* DRAW MIDDLE LINE (ONLY IN 2-PLAYER MODE) */
        if (!is_multiplayer) {
            ping_pong_game.setLineDash([5, 15]);
            ping_pong_game.beginPath();
            ping_pong_game.moveTo(GameLogic.CANVAS_WIDTH / 2, 0);
            ping_pong_game.lineTo(GameLogic.CANVAS_WIDTH / 2, GameLogic.CANVAS_HEIGHT);
            ping_pong_game.strokeStyle = "white";
            ping_pong_game.stroke();
        }

        /* DRAW PADDLES */
        ping_pong_game.fillStyle = "white";

        ping_pong_game.fillRect(0, game_state.current.paddle_left.y, GameLogic.PADDLE_WIDTH, GameLogic.PADDLE_HEIGHT);
        ping_pong_game.fillRect(GameLogic.CANVAS_WIDTH - GameLogic.PADDLE_WIDTH, game_state.current.paddle_right.y, GameLogic.PADDLE_WIDTH, GameLogic.PADDLE_HEIGHT);

        if (is_multiplayer && game_state.current.paddle_bottom)
        {
            ping_pong_game.fillRect(game_state.current.paddle_bottom.x,
                GameLogic.CANVAS_HEIGHT - GameLogic.BOTTOM_PADDLE_HEIGHT,
                GameLogic.BOTTOM_PADDLE_WIDTH,
                GameLogic.BOTTOM_PADDLE_HEIGHT);
        }

        /* DRAW BALL */
        ping_pong_game.fillRect(game_state.current.ball.x, game_state.current.ball.y, GameLogic.BALL_SIZE, GameLogic.BALL_SIZE);

        /* DRAW SCORES */
        ping_pong_game.font = "48px Arial";
        ping_pong_game.textAlign = "center";

        if (is_multiplayer)
        {
            ping_pong_game.fillText(score.left.toString(), GameLogic.CANVAS_WIDTH / 4, 50);
            ping_pong_game.fillText(score.right.toString(), (GameLogic.CANVAS_WIDTH / 4) * 3, 50);
            if (score.bottom !== undefined)
            {
                ping_pong_game.fillText(score.bottom.toString(), GameLogic.CANVAS_WIDTH / 2, GameLogic.CANVAS_HEIGHT - 20);
            }
        }
        else
        {
            ping_pong_game.fillText(score.left.toString(), GameLogic.CANVAS_WIDTH / 4, 50);
            ping_pong_game.fillText(score.right.toString(), (GameLogic.CANVAS_WIDTH / 4) * 3, 50);
        }
    }, [score, is_multiplayer]);


    /**
     * Ends the game safely with guaranteed single callback and correct winner score
     */
    const end_game = useCallback((winner: Player) =>
    {
        if (game_completed.current)
            return;

        if (animation_ref.current)
        {
            cancelAnimationFrame(animation_ref.current);
            animation_ref.current = null;
        }

        set_game_started(false);
        set_is_paused(true);
        game_completed.current = true;

        let final_score = {...score};

        if (winner.id === player1.id)
        {
            final_score.left = GameLogic.POINTS_TO_WIN;
        }
        else if (winner.id === player2.id)
        {
            final_score.right = GameLogic.POINTS_TO_WIN;
        }
        else if (is_multiplayer && player3 && winner.id === player3.id)
        {
            if (final_score.bottom !== undefined)
            {
                final_score.bottom = GameLogic.POINTS_TO_WIN;
            }
        }

        console.log(`Game ended, score adjusted to: ${final_score.left}-${final_score.right}${is_multiplayer ? `-${final_score.bottom}` : ''}`);
        console.log(`winner: ${winner.alias}`);

        setTimeout(() =>
        {
            on_game_complete(winner, final_score);
        }, 50);
    }, [on_game_complete, score, player1, player2, player3, is_multiplayer]);


    /* SET UP KEYBOARD CONTROLS */
    useEffect(() =>
    {
        const handlers = create_keyboard_handlers(game_state, game_started, is_paused, validate_game_action);
        keyboard_handlers.current = handlers;

        window.addEventListener("keydown", handlers.handle_key_down);
        window.addEventListener("keyup", handlers.handle_key_up);

        return () =>
        {
            window.removeEventListener("keydown", handlers.handle_key_down);
            window.removeEventListener("keyup", handlers.handle_key_up);
        };
    }, [game_started, is_paused]);


    /* MAIN GAME LOOP */
    useEffect(() =>
    {
        if (!validate_game_action() || game_completed.current)
            return;

        const canvas = canvas_ref.current;

        if (!canvas)
            return;

        const ping_pong_game = canvas.getContext("2d");

        if (!ping_pong_game)
            return;

        render_game(ping_pong_game);

        if (game_started && !is_paused)
        {
            const game_loop = () =>
            {
                if (!game_started || is_paused || !validate_game_action() || game_completed.current)
                {
                    return;
                }

                keyboard_handlers.current.process_keyboard_input();

                /* UPDATE BALL POSITION */
                GameLogic.update_ball_position(game_state.current);

                /* HANDLE COLLISIONS */
                GameLogic.handle_ball_collisions(game_state.current);

                /* CHECK FOR SCORING */
                const scoring_result = GameLogic.check_scoring(game_state.current);

                if (scoring_result.scored)
                {
                    set_score(prev =>
                    {
                        if (scoring_result.player === "left")
                        {
                            const new_score = { ...prev, left: prev.left + 1 };

                            if (new_score.left >= GameLogic.POINTS_TO_WIN)
                            {
                                setTimeout(() =>
                                {
                                    if (!game_completed.current) end_game(player1);
                                }, 0);
                            }

                            return new_score;
                        }
                        else if (scoring_result.player === "right")
                        {
                            const new_score = { ...prev, right: prev.right + 1 };

                            if (new_score.right >= GameLogic.POINTS_TO_WIN)
                            {
                                setTimeout(() =>
                                {
                                    if (!game_completed.current) end_game(player2);
                                }, 0);
                            }

                            return new_score;
                        }
                        else if (scoring_result.player === "bottom" && is_multiplayer && player3)
                        {
                            const new_score =
                            {
                                ...prev,
                                bottom: prev.bottom !== undefined ? prev.bottom + 1 : 1
                            };

                            if (new_score.bottom !== undefined && new_score.bottom >= GameLogic.POINTS_TO_WIN)
                            {
                                setTimeout(() =>
                                {
                                    if (!game_completed.current) end_game(player3);
                                }, 0);
                            }

                            return new_score;
                        }

                        return prev;
                    });

                    reset_ball();
                }

                /* RENDER THE GAME */
                render_game(ping_pong_game);

                /* CONTINUE ANIMATION IF GAME IS STILL RUNNING */
                if (!game_completed.current)
                {
                    animation_ref.current = requestAnimationFrame(game_loop);
                }
            };

            animation_ref.current = requestAnimationFrame(game_loop);
        }

        return () =>
        {
            if (animation_ref.current)
            {
                cancelAnimationFrame(animation_ref.current);
                animation_ref.current = null;
            }
        };
    }, [game_started, is_paused, render_game, end_game, player1, player2, player3, is_multiplayer]);


    /**
     * Handles game control button clicks
     */
    const handle_game_control_click = () =>
    {
        if (!validate_game_action() || game_completed.current)
            return;

        if (!game_started)
        {
            set_game_started(true);
            set_is_paused(false);
        }
        else
            set_is_paused(!is_paused);
    };


    return (
        <div className="flex flex-col items-center">
            <ScoreDisplay
                player1={player1}
                player2={player2}
                player3={player3}
                score={score}
                points_to_win={GameLogic.POINTS_TO_WIN}
                is_multiplayer={is_multiplayer}
            />

            <GameControls
                game_started={game_started}
                is_game_paused={is_paused}
                on_click={handle_game_control_click}
            />

            <canvas
                ref={canvas_ref}
                width={GameLogic.CANVAS_WIDTH}
                height={GameLogic.CANVAS_HEIGHT}
                className="border-2 border-gray-300"
            />

            <div className="mt-4">
                <p className="text-center">Controls:</p>
                <p>{player1.alias}: W (up) / S (down)</p>
                <p>{player2.alias}: P (up) / L (down)</p>
                {is_multiplayer && player3 && (
                    <p>{player3.alias}: V (left) / B (right)</p>
                )}
            </div>
        </div>
    );
};


export default RenderGame;
