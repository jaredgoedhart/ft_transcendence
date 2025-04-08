/*
frontend/src/components/Game/GameControls.tsx

Component for game control buttons with start, pause, and resume functionality.
Adapts button labels to the game state and ensures a consistent interface across modes.
*/



import React from "react";


/**
 * Interface that defines all required and optional properties for the GameControls component
 * Specifying exactly what data the component needs to function
 */
interface GameControlsProperties
{
    game_started: boolean;
    is_game_paused: boolean;
    on_click: () => void;
}


/**
 * Controls for starting/pausing the game
 */
const GameControls: React.FC<GameControlsProperties> = ({
                                                              game_started,
                                                              is_game_paused,
                                                              on_click
                                                          }) =>
{

    /**
     * Determines the appropriate button text based on the game state.
     */
    const get_button_text = (): string =>
    {
        if (!game_started)
        {
            return "Start Game";
        }
        else if (is_game_paused)
        {
            return "Resume Game";
        }
        else
        {
            return "Pause Game";
        }
    }


    return (
        <div className="mb-4 flex space-x-4">
            <button
                onClick={on_click}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                {get_button_text()}
            </button>
        </div>
    );
};


export default GameControls;
