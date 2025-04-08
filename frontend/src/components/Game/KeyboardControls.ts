/*
frontend/src/components/Game/KeyboardControls.ts

This file contains keyboard input handling for Pong game controls.
Manages simultaneous key presses, paddle movement logic, and
proper game state validation. Ensures responsive and fluid
player interaction with the game.
*/


import { MutableRefObject } from "react";
import { GameStateReference } from "./Types";
import { PADDLE_SPEED, CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_HEIGHT, BOTTOM_PADDLE_WIDTH } from "./GameLogic";


const pressed_keys: { [key: string]: boolean } =
    {
        'w': false,
        's': false,
        'p': false,
        'l': false,
        'v': false,
        'b': false
    };


/**
 * Creates keyboard handlers for paddle control with support for simultaneous key presses
 */
export const create_keyboard_handlers = (
    game_state: MutableRefObject<GameStateReference>,
    game_started: boolean,
    is_game_paused: boolean,
    validate_game_action: () => boolean
) =>
{
    /**
     * Handles key down events by marking keys as pressed
     */
    const handle_key_down = (keyboard_event: KeyboardEvent): void =>
    {
        const key: string = keyboard_event.key.toLowerCase();

        if (['w', 's', 'p', 'l', 'v', 'b'].includes(key))
        {
            pressed_keys[key] = true;
        }
    };


    /**
     * Handles key up events by marking keys as released
     */
    const handle_key_up = (keyboard_event: KeyboardEvent): void =>
    {
        const key: string = keyboard_event.key.toLowerCase();

        if (['w', 's', 'p', 'l', 'v', 'b'].includes(key))
        {
            pressed_keys[key] = false;
        }
    };


    /**
     * Processes all currently pressed keys to move paddles
     */
    const process_keyboard_input = (): void =>
    {
        if (!game_started || is_game_paused || !validate_game_action())
            return;

        if (pressed_keys['w'])
        {
            game_state.current.paddle_left.y = Math.max(0, game_state.current.paddle_left.y - PADDLE_SPEED);
        }

        if (pressed_keys['s'])
        {
            game_state.current.paddle_left.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game_state.current.paddle_left.y + PADDLE_SPEED);
        }

        if (pressed_keys['p'])
        {
            game_state.current.paddle_right.y = Math.max(0, game_state.current.paddle_right.y - PADDLE_SPEED);
        }

        if (pressed_keys['l'])
        {
            game_state.current.paddle_right.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game_state.current.paddle_right.y + PADDLE_SPEED);
        }

        if (game_state.current.is_multiplayer && game_state.current.paddle_bottom)
        {
            if (pressed_keys['v'])
            {
                game_state.current.paddle_bottom.x = Math.max(0, game_state.current.paddle_bottom.x - PADDLE_SPEED);
            }

            if (pressed_keys['b'])
            {
                game_state.current.paddle_bottom.x = Math.min(CANVAS_WIDTH - BOTTOM_PADDLE_WIDTH, game_state.current.paddle_bottom.x + PADDLE_SPEED);
            }
        }
    };


    return {
        handle_key_down,
        handle_key_up,
        process_keyboard_input
    };
};
