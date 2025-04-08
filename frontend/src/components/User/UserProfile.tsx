/*
frontend/src/components/User/UserProfile.tsx

This file contains the component for user profile display and management.
Shows user information, statistics, and settings tabs for security,
privacy, and game session history. Handles profile editing, avatar
uploads, and various user-related settings in a comprehensive interface.
*/


import React, { useState, useEffect } from "react";
import { use_authentication } from "../../context/AuthenticationContext";
import { user_api } from "../../services/api";
import UserAvatar from "./UserAvatar";
import UserStats from "./UserStats";
import TwoFactorSettings from "./TwoFactorSettings";
import GameSessionDashboard from "./GameSessionDashboard";
import GDPRSettings from "./GDPRSettings";


interface UserProfileProperties
{
    user_id?: number; // Optioneel: als niet opgegeven, wordt de ingelogde gebruiker getoond
}


/**
 * Component for displaying and editing user profile
 */
const UserProfile: React.FC<UserProfileProperties> = ({ user_id }) =>
{
    const { user, refresh_user, check_user_online_status } = use_authentication();
    const [profile_user, set_profile_user] = useState<any>(null);
    const [loading, set_loading] = useState<boolean>(true);
    const [error, set_error] = useState<string>("");
    const [is_editing, set_is_editing] = useState<boolean>(false);
    const [display_name, set_display_name] = useState<string>("");
    const [email, set_email] = useState<string>("");
    const [selected_tab, set_selected_tab] = useState<string>("profile");

    const is_own_profile = !user_id || (user && user.id === user_id);

    const effective_user_id = user_id || user?.id;


    /**
     * Fetches user profile data
     */
    useEffect(() =>
    {
        const fetch_user_profile = async (): Promise<void> =>
        {
            try
            {
                set_loading(true);

                if (is_own_profile)
                {
                    if (user)
                    {
                        set_profile_user(user);
                        set_display_name(user.display_name);
                        set_email(user.email);
                    }
                }
                else
                {
                    set_profile_user(user);
                }

                set_loading(false);
            }
            catch (error)
            {
                console.error("Error fetching user profile:", error);
                set_error("Failed to load user profile");
                set_loading(false);
            }
        };

        if (user)
        {
            fetch_user_profile().catch((error) => { console.error("Error fetching profile:", error); set_error("Failed to load user profile"); });
        }
    }, [user, user_id, is_own_profile]);


    /**
     * Handles profile update submission
     */
    const handle_submit_profile = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();

        if (!display_name)
        {
            set_error("Display name is required");
            return;
        }

        try
        {
            const update_data = { display_name, email };
            await user_api.update_profile(update_data);

            await refresh_user();
            set_is_editing(false);
            set_error("");
        }
        catch (error)
        {
            console.error("Error updating profile:", error);
            set_error("Failed to update profile. Display Name and Email must be unique.");
        }
    };


    /**
     * Handles avatar upload
     */
    const handle_avatar_upload = async (file: File): Promise<void> =>
    {
        try
        {
            await user_api.upload_avatar(file);
            await refresh_user();
        }
        catch (error)
        {
            console.error("Error uploading avatar:", error);
            set_error("Failed to upload avatar");
        }
    };

    if (loading)
    {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading profile...</div>
            </div>
        );
    }

    if (!profile_user)
    {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">User not found</div>
            </div>
        );
    }

    const is_user_online = effective_user_id ? check_user_online_status(effective_user_id) : false;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                    <div className="md:mr-8 mb-4 md:mb-0">
                        <UserAvatar
                            avatar_url={profile_user.avatar_url}
                            display_name={profile_user.display_name}
                            is_editable={is_own_profile}
                            on_upload={handle_avatar_upload}
                        />
                    </div>

                    <div className="flex-1">
                        {is_editing ? (
                            <form onSubmit={handle_submit_profile} className="space-y-4">
                                <div>
                                    <div className="block text-gray-700 mb-2">Display Name</div>
                                    <input
                                        type="text"
                                        id="display_name"
                                        value={display_name}
                                        onChange={(e) => set_display_name(e.target.value)}
                                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Display Name"
                                    />
                                </div>

                                <div>
                                    <div className="block text-gray-700 mb-2">Email</div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => set_email(e.target.value)}
                                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email"
                                    />
                                </div>

                                {error && <div className="text-red-500">{error}</div>}

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => set_is_editing(false)}
                                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {profile_user.display_name}
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                    @{profile_user.username}
                                </span>
                                </h1>

                                {is_own_profile && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => set_is_editing(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className={`font-medium flex items-center ${is_user_online ? "text-green-600" : "text-gray-500"}`}>
                                        <span className={`${is_user_online ? "bg-green-500" : "bg-gray-400"} h-3 w-3 rounded-full inline-block mr-2`}></span>
                                        {is_user_online ? "Online" : "Offline"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => set_selected_tab("profile")}
                            className={`px-4 py-2 ${selected_tab === "profile" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => set_selected_tab("stats")}
                            className={`px-4 py-2 ${selected_tab === "stats" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Statistics
                        </button>

                        <button
                            onClick={() => set_selected_tab("sessions")}
                            className={`px-4 py-2 ${selected_tab === "sessions" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Game Sessions
                        </button>
                        <button
                            onClick={() => set_selected_tab("security")}
                            className={`px-4 py-2 ${selected_tab === "security" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Security
                        </button>
                        {is_own_profile && (
                            <button
                                onClick={() => set_selected_tab("privacy")}
                                className={`px-4 py-2 ${selected_tab === "privacy" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                            >
                                Privacy & Data
                            </button>
                        )}
                    </div>

                    <div className="mt-4">
                        {selected_tab === "profile" && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">About</h2>
                                <p>Email: {profile_user.email}</p>
                                <p>Account created: {new Date(profile_user.created_at).toLocaleDateString()}</p>
                            </div>
                        )}

                        {selected_tab === "stats" && effective_user_id && (
                            <UserStats user_id={effective_user_id} />
                        )}

                        {selected_tab === "sessions" && (
                            <GameSessionDashboard user_id={effective_user_id} />
                        )}

                        {selected_tab === "security" && is_own_profile && (
                            <TwoFactorSettings />
                        )}

                        {selected_tab === "privacy" && is_own_profile && (
                            <GDPRSettings />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UserProfile;
