/*
frontend/src/components/User/FriendsList.tsx

This file contains the component for managing user friendships.
Displays friend lists with online status indicators, handles friend requests,
and provides functionality for accepting, rejecting, and removing friends.
Implements the social networking aspects of the application.
*/


import React, { useState, useEffect } from "react";
import { friends_api } from "../../services/api";
import { use_authentication } from "../../context/AuthenticationContext";


interface FriendsListProperties
{
    on_select_friend: (friend: any) => void;
}


interface FriendData
{
    friendship_id: number;
    friendship_status: "pending" | "accepted" | "rejected";
    is_sender: boolean;
    friend:
    {
        id: number;
        display_name: string;
        username: string;
        avatar_url: string | null;
        is_online: boolean;
    };
}


/**
 * Component for displaying and managing friends list
 */
const FriendsList: React.FC<FriendsListProperties> = ({ on_select_friend }) =>
{
    const { user } = use_authentication();
    const [friends, set_friends] = useState<FriendData[]>([]);
    const [loading, set_loading] = useState<boolean>(true);
    const [error, set_error] = useState<string>("");
    const [friend_request, set_friend_request] = useState<string>("");
    const [request_error, set_request_error] = useState<string>("");
    const [request_loading, set_request_loading] = useState<boolean>(false);
    const [selected_tab, set_selected_tab] = useState<string>("all");


    /**
     * Fetches friends list from the API
     */
    useEffect(() =>
    {
        const fetch_friends = async (): Promise<void> =>
        {
            try
            {
                set_loading(true);
                console.log("Fetching friends list...");

                const response = await friends_api.get_friends();
                console.log("Friends API response:", response.data);

                set_friends(response.data.friends || []);
                set_loading(false);
            }
            catch (error)
            {
                console.error("Error fetching friends:", error);
                set_error("Failed to load friends");
                set_loading(false);
                set_friends([]);
            }
        };

        fetch_friends().catch(error =>
        {
            console.error("Error fetching friends:", error);
        });

        const timeout = setTimeout(() =>
        {
            if (loading)
            {
                console.log("Friends list fetch timeout - forcing loading to stop");
                set_loading(false);
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);


    /**
     * Handles friend request submission
     */
    const handle_send_request = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();

        if (!friend_request.trim())
        {
            set_request_error("Please enter a username or ID");
            return;
        }

        set_request_loading(true);
        set_request_error("");

        try
        {
            const friend_id = parseInt(friend_request, 10);

            if (isNaN(friend_id))
            {
                set_request_error("Please enter a valid user ID");
                set_request_loading(false);
                return;
            }

            if (user && user.id === friend_id)
            {
                set_request_error("You cannot add yourself as a friend");
                set_request_loading(false);
                return;
            }

            await friends_api.send_friend_request(friend_id);

            const response = await friends_api.get_friends();
            set_friends(response.data.friends || []);

            set_friend_request("");
            set_request_loading(false);
        }
        catch (error)
        {
            console.error("Error sending friend request:", error);
            set_request_error("Failed to send friend request");
            set_request_loading(false);
        }
    };


    /**
     * Handles accepting a friend request
     */
    const handle_accept_request = async (friendship_id: number): Promise<void> =>
    {
        try
        {
            await friends_api.accept_friend_request(friendship_id);

            set_friends(current_friends =>
            {
                return current_friends.map(friend =>
                {
                    if (friend.friendship_id === friendship_id)
                    {
                        return {...friend, friendship_status: "accepted"};
                    }
                    return friend;
                });
            });
        }
        catch (error)
        {
            console.error("Error accepting friend request:", error);
            set_error("Failed to accept friend request");
        }
    };


    /**
     * Handles rejecting a friend request
     */
    const handle_reject_request = async (friendship_id: number): Promise<void> =>
    {
        try
        {
            await friends_api.reject_friend_request(friendship_id);

            set_friends(current_friends =>
            {
                return current_friends.map(friend =>
                {
                    if (friend.friendship_id === friendship_id)
                    {
                        return {...friend, friendship_status: "rejected"};
                    }
                    return friend;
                });
            });
        }
        catch (error)
        {
            console.error("Error rejecting friend request:", error);
            set_error("Failed to reject friend request");
        }
    };


    /**
     * Handles removing a friendship
     */
    const handle_remove_friend = async (friendship_id: number): Promise<void> =>
    {
        if (!window.confirm("Are you sure you want to remove this friend?"))
            return;

        try
        {
            await friends_api.remove_friendship(friendship_id);

            set_friends(current_friends =>
                current_friends.filter(friend => friend.friendship_id !== friendship_id)
            );
        }
        catch (error)
        {
            console.error("Error removing friend:", error);
            set_error("Failed to remove friend");
        }
    };


    /**
     * Checks if there are pending friend requests
     */
    const has_pending_requests = (): boolean =>
    {
        return friends.some(friend =>
            friend.friendship_status === "pending" && !friend.is_sender
        );
    };


    /**
     * Filters friends based on selected tab
     */
    const filtered_friends = (): FriendData[] =>
    {
        if (!friends || !Array.isArray(friends))
        {
            console.warn("Friends is not an array:", friends);
            return [];
        }

        switch (selected_tab)
        {
            case "pending":
                return friends.filter(friend =>
                    friend.friendship_status === "pending" && !friend.is_sender
                );
            case "sent":
                return friends.filter(friend =>
                    friend.friendship_status === "pending" && friend.is_sender
                );
            case "online":
                return friends.filter(friend =>
                    friend.friendship_status === "accepted" && friend.friend.is_online
                );
            default:
                return friends.filter(friend =>
                    friend.friendship_status === "accepted"
                );
        }
    };


    /**
     * Renders the add friend form
     */
    const render_add_friend_form = () =>
    {
        return (
            <form onSubmit={handle_send_request} className="mb-6 bg-white p-4 rounded shadow">
                <h3 className="text-lg font-medium mb-4">Add Friend</h3>

                <div className="flex flex-col">
                    <div className="mb-2 text-sm text-gray-600">
                        {user && (
                            <div>
                                <p>Your ID: <span className="font-semibold">{user.id}</span></p>
                                <p className="text-xs mt-1">Share your ID with friends so they can add you.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex mt-2">
                        <input
                            type="text"
                            value={friend_request}
                            onChange={(e) => set_friend_request(e.target.value)}
                            placeholder="Enter friend's user ID"
                            className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={request_loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
                        >
                            {request_loading ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </div>

                {request_error && (
                    <div className="mt-2 text-red-500 text-sm">{request_error}</div>
                )}
            </form>
        );
    };


    if (loading && friends.length === 0)
    {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="text-gray-600">Loading friends...</div>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Friends</h2>

            {render_add_friend_form()}

            {error && (
                <div className="mb-4 text-red-500">{error}</div>
            )}

            <div className="bg-white rounded shadow overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => set_selected_tab("all")}
                        className={`px-4 py-2 ${selected_tab === "all" ? "bg-gray-100 font-medium" : ""}`}
                    >
                        All Friends
                    </button>
                    <button
                        onClick={() => set_selected_tab("online")}
                        className={`px-4 py-2 ${selected_tab === "online" ? "bg-gray-100 font-medium" : ""}`}
                    >
                        Online
                    </button>
                    <button
                        onClick={() => set_selected_tab("pending")}
                        className={`px-4 py-2 relative ${selected_tab === "pending" ? "bg-gray-100 font-medium" : ""}`}
                    >
                        Pending Requests
                        {has_pending_requests() && (
                            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => set_selected_tab("sent")}
                        className={`px-4 py-2 ${selected_tab === "sent" ? "bg-gray-100 font-medium" : ""}`}
                    >
                        Sent Requests
                    </button>
                </div>

                <div className="divide-y">
                    {filtered_friends().length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            {selected_tab === "pending" ? "No pending friend requests" :
                                selected_tab === "sent" ? "No sent friend requests" :
                                    selected_tab === "online" ? "No friends online" :
                                        "No friends found"}
                        </div>
                    ) : (
                        filtered_friends().map((friend) => (
                            <div key={friend.friendship_id} className="p-4 flex items-center justify-between">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => on_select_friend(friend.friend)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden">
                                        {friend.friend.avatar_url ? (
                                            <img
                                                src={friend.friend.avatar_url ?
                                                    `https://localhost${friend.friend.avatar_url}` :
                                                    undefined}
                                                alt={`${friend.friend.display_name}'s avatar`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-600 font-bold text-lg">
                                                {friend.friend.display_name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="font-medium">{friend.friend.display_name}</div>
                                        <div className="text-sm text-gray-500">@{friend.friend.username}</div>
                                        <div className="text-xs text-gray-400">ID: {friend.friend.id}</div>
                                    </div>

                                    {friend.friendship_status === "accepted" && (
                                        <div className={`ml-4 ${friend.friend.is_online ? "text-green-500" : "text-gray-400"} flex items-center`}>
                                            <span className={`${friend.friend.is_online ? "bg-green-500" : "bg-gray-400"} h-2 w-2 rounded-full inline-block mr-1`}></span>
                                            {friend.friend.is_online ? "Online" : "Offline"}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    {friend.friendship_status === "pending" && !friend.is_sender && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handle_accept_request(friend.friendship_id)}
                                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handle_reject_request(friend.friendship_id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {friend.friendship_status === "pending" && friend.is_sender && (
                                        <span className="text-sm text-gray-500">Pending</span>
                                    )}

                                    {friend.friendship_status === "accepted" && (
                                        <button
                                            onClick={() => handle_remove_friend(friend.friendship_id)}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


export default FriendsList;
