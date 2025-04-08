/*
frontend/src/components/Game/FinalTournamentMatch.tsx

This file contains the component for displaying the tournament final match screen.
Shows the players who have advanced to the final round and provides options
to start the decisive match or cancel.
*/


import React from "react";
import { Player } from "./Types";


interface FinalTournamentMatchProperties
{
    player1: Player;
    player2: Player;
    on_start_final: () => void;
    on_cancel: () => void;
}


const FinalTournamentMatch: React.FC<FinalTournamentMatchProperties> = ({
                                                                            player1,
                                                                            player2,
                                                                            on_start_final,
                                                                            on_cancel
                                                                        }) =>
{
    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Tournament Final</h2>

            <div className="mb-8 p-4 bg-yellow-50 rounded border border-yellow-200">
                <h3 className="font-bold mb-4 text-center text-yellow-800">
                    Championship Match
                </h3>

                <div className="flex justify-center items-center mb-6">
                    <div className="text-center px-8">
                        <div className="text-xl font-semibold mb-2">{player1.alias}</div>
                        <div className="text-sm text-gray-600">Wins: {player1.wins}</div>
                    </div>

                    <div className="px-6 text-2xl font-bold text-gray-500">VS</div>

                    <div className="text-center px-8">
                        <div className="text-xl font-semibold mb-2">{player2.alias}</div>
                        <div className="text-sm text-gray-600">Wins: {player2.wins}</div>
                    </div>
                </div>

                <p className="text-center mb-6">
                    Both players have reached the final! This match will determine the tournament champion.
                </p>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={on_start_final}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Start Final Match
                    </button>

                    <button
                        onClick={on_cancel}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">Important Note</h3>
                <p className="mb-4">
                    The winner of this final match will be declared the tournament champion, regardless of the total win count.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border">
                        <div className="font-semibold">{player1.alias}</div>
                        <div className="text-sm text-gray-600">
                            Current wins: {player1.wins}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                        <div className="font-semibold">{player2.alias}</div>
                        <div className="text-sm text-gray-600">
                            Current wins: {player2.wins}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default FinalTournamentMatch;
