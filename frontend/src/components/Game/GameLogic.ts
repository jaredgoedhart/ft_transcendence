/*
frontend/src/components/Game/GameLogic.ts

This file contains core game mechanics and physics for the Pong game.
Defines canvas dimensions, paddle and ball properties, collision detection,
scoring logic, and game state initialization. Forms the foundation of
the game's functionality across all play modes.
*/


import { GameStateReference } from "./Types";


export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PADDLE_HEIGHT = 117;
export const PADDLE_WIDTH = 10;
export const BOTTOM_PADDLE_HEIGHT = 10;  // Hoogte van onderste paddle
export const BOTTOM_PADDLE_WIDTH = 117;   // Breedte van onderste paddle
export const BALL_SIZE = 10;
export const PADDLE_SPEED = 40;
export const POINTS_TO_WIN = 5;


/**
 * Creates initial game state with default values
 */
export const initialize_game_state = (token: string, is_multiplayer: boolean = false): GameStateReference =>
{
    const paddle_y_position: number = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

    const paddle_left: { y: number } =
    {
        y: paddle_y_position
    };

    const paddle_right: { y: number } =
    {
        y: paddle_y_position
    };

    const ball: { x: number, y: number, dx: number, dy: number } =
    {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        dx: 5,
        dy: 5
    };

    const game_state: GameStateReference =
    {
        paddle_left: paddle_left,
        paddle_right: paddle_right,
        ball: ball,
        token: token,
        is_multiplayer: is_multiplayer
    };

    if (is_multiplayer)
    {
        game_state.paddle_bottom =
        {
            x: CANVAS_WIDTH / 2 - BOTTOM_PADDLE_WIDTH / 2
        };
    }

    return game_state;
};


/**
 * Resets ball to center with random direction
 */
export const reset_ball = (game_state: GameStateReference): void =>
{
    const center_x: number = CANVAS_WIDTH / 2;
    const center_y: number = CANVAS_HEIGHT / 2;

    let dx: number = 5;
    let dy: number = 5;

    if (Math.random() <= 0.5)
        dx = -dx;

    if (Math.random() <= 0.5)
        dy = -dy;

    game_state.ball =
    {
        x: center_x,
        y: center_y,
        dx: dx,
        dy: dy
    };
};


/**
 * Updates ball position based on velocity
 */
export const update_ball_position = (game_state: GameStateReference): void =>
{
    game_state.ball.x += game_state.ball.dx;
    game_state.ball.y += game_state.ball.dy;
};


/**
 * Handles ball collisions with paddles and walls
 */
export const handle_ball_collisions = (game_state: GameStateReference): void =>
{
    const is_multiplayer: boolean = game_state.is_multiplayer || false;

    /* BALL COLLISION WITH TOP WALL */
    if (game_state.ball.y <= 0)
    {
        game_state.ball.dy *= -1;
    }

    /* BALL COLLISION WITH BOTTOM */
    if (is_multiplayer && game_state.paddle_bottom)
    {
        if (game_state.ball.y >= CANVAS_HEIGHT - BALL_SIZE - BOTTOM_PADDLE_HEIGHT &&
            game_state.ball.x >= game_state.paddle_bottom.x &&
            game_state.ball.x <= game_state.paddle_bottom.x + BOTTOM_PADDLE_WIDTH)
        {
            game_state.ball.dy = -Math.abs(game_state.ball.dy);
        }
    }
    else
    {
        if (game_state.ball.y >= CANVAS_HEIGHT - BALL_SIZE)
        {
            game_state.ball.dy *= -1;
        }
    }

    /* BALL COLLISION WITH LEFT PADDLE */
    if (game_state.ball.x <= PADDLE_WIDTH &&
        game_state.ball.y >= game_state.paddle_left.y &&
        game_state.ball.y <= game_state.paddle_left.y + PADDLE_HEIGHT)
    {
        game_state.ball.dx = Math.abs(game_state.ball.dx);
    }

    /* BALL COLLISION WITH RIGHT PADDLE */
    if (game_state.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        game_state.ball.y >= game_state.paddle_right.y &&
        game_state.ball.y <= game_state.paddle_right.y + PADDLE_HEIGHT)
    {
        game_state.ball.dx = -Math.abs(game_state.ball.dx);
    }
};


/**
 * Checks if a player scored and returns the result
 */
export const check_scoring = (game_state: GameStateReference): { scored: boolean, player: 'left' | 'right' | 'bottom' } =>
{
    const is_multiplayer: boolean = game_state.is_multiplayer || false;

    if (game_state.ball.x >= CANVAS_WIDTH)
    {
        return { scored: true, player: 'left' };
    }

    if (game_state.ball.x <= 0)
    {
        return { scored: true, player: 'right' };
    }

    if (is_multiplayer && game_state.ball.y >= CANVAS_HEIGHT)
    {
        return { scored: true, player: 'bottom' };
    }

    return { scored: false, player: 'left' };
};
