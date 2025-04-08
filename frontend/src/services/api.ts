/*
frontend/src/services/api.ts

Centralizes all API service calls for the application using Axios.
Handles communication with the backend, including user login, registration, profile management,
friends, two-factor authentication, match history, and GDPR actions.
Includes features to manage authentication and handle errors automatically.
*/


import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";


/**
 * Base API configuration
 */
const api_configuration: AxiosRequestConfig<any> =
    {
        baseURL: process.env.REACT_APP_API_URL || "https://localhost",
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
        withCredentials: true
    };


/**
 * API client instance
 */
const api_client: AxiosInstance = axios.create(api_configuration);


/**
 * Adds authentication token to requests
 */
api_client.interceptors.request.use((configuration: InternalAxiosRequestConfig) =>
{
    const token: string | null = localStorage.getItem("token");

    if (token)
    {
        configuration.headers = configuration.headers || {};
        configuration.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`API Request: ${configuration.method?.toUpperCase()} ${configuration.url}`, configuration);

    return configuration;
});


/**
 * Interceptor for API responses for better debugging
 */
api_client.interceptors.response.use((response) =>
    {
        console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) =>
    {
        if (error.response)
        {
            console.error(`API Error: ${error.response.status} ${error.config?.url}`, error.response.data);
        }
        else if (error.request)
        {
            console.error(`API Request Error: No response received for ${error.config?.url}`, error);

            // Check if the error might be related to HTTPS issues
            if (error.message && (
                error.message.includes("certificate") ||
                error.message.includes("SSL") ||
                error.message.includes("self signed") ||
                error.message.includes("unable to verify")
            )) {
                console.error("This appears to be an HTTPS/SSL certificate issue. Please verify your certificates are properly configured.");
            }
        }
        else
        {
            console.error(`API Error: ${error.message}`);
        }

        return Promise.reject(error);
    }
);


/**
 * Authentication related API calls
 */
export const authentication_api =
    {
        /**
         * Registers a new user
         */
        register: async (username: string, email: string, password: string, display_name: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/auth/register", { username, email, password, display_name });
        },

        /**
         * Logs in a user with credentials
         */
        login: async (identifier: string, password: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/auth/login", { identifier, password });
        },

        /**
         * Verifies 2FA token during login
         */
        verify_2fa: async (user_id: number, token: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/auth/verify-2fa", { user_id, token });
        },

        /**
         * Authenticates user with Google
         */
        google_login: async (id_token: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/auth/google", { id_token });
        }
    };


/**
 * User related API calls
 */
export const user_api =
    {
        /**
         * Gets the current user's profile
         */
        get_profile: async (): Promise<AxiosResponse> =>
        {
            return api_client.get("/api/user/profile");
        },

        /**
         * Updates user profile information
         */
        update_profile: async (data: { display_name?: string, email?: string }): Promise<AxiosResponse> =>
        {
            return api_client.put("/api/user/profile", data);
        },

        /**
         * Uploads a user avatar
         */
        upload_avatar: async (file: File): Promise<AxiosResponse> =>
        {
            const form_data = new FormData();

            form_data.append("file", file);

            return api_client.post("/api/user/avatar", form_data, { headers: { "Content-Type": "multipart/form-data" }});
        }
    };


/**
 * Friends related API calls
 */
export const friends_api =
    {
        /**
         * Gets the user's friends list
         */
        get_friends: async (): Promise<AxiosResponse> =>
        {
            try
            {
                return await api_client.get("/api/friends");
            }
            catch (error)
            {
                console.error("Failed to fetch friends:", error);

                return {
                    data: { friends: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                };
            }
        },

        /**
         * Sends a friend request
         */
        send_friend_request: async (friend_id: number): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/friends/request", { friend_id });
        },

        /**
         * Accepts a friend request
         */
        accept_friend_request: async (friendship_id: number): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/friends/accept", { friendship_id });
        },

        /**
         * Rejects a friend request
         */
        reject_friend_request: async (friendship_id: number): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/friends/reject", { friendship_id });
        },

        /**
         * Removes a friendship
         */
        remove_friendship: async (friendship_id: number): Promise<AxiosResponse> =>
        {
            return api_client.delete(`/api/friends/${friendship_id}`);
        }
    };


/**
 * Two-factor authentication related API calls
 */
export const two_factor_api =
    {
        /**
         * Generates 2FA setup for the user
         */
        generate_setup: async (): Promise<AxiosResponse> =>
        {
            return api_client.get("/api/2fa/setup");
        },

        /**
         * Enables 2FA for the user
         */
        enable_2fa: async (token: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/2fa/enable", { token });
        },

        /**
         * Disables 2FA for the user
         */
        disable_2fa: async (): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/2fa/disable");
        }
    };

/**
 * Match history related API calls
 */
export const match_api =
    {
        /**
         * Gets the user's match history
         */
        get_history: async (limit: number = 10, offset: number = 0): Promise<AxiosResponse> =>
        {
            try
            {
                return await api_client.get(`/api/matches/history?limit=${limit}&offset=${offset}`, {timeout: 30000});
            }
            catch (error)
            {
                console.error(`Failed to fetch match history (limit=${limit}, offset=${offset}):`, error);

                return {
                    data: { matches: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                };
            }
        },

        /**
         * Gets the user's match statistics
         */
        get_statistics: async (): Promise<AxiosResponse> =>
        {
            try
            {
                return await api_client.get("/api/matches/statistics", {timeout: 30000});
            }
            catch (error)
            {
                console.error("Failed to fetch match statistics:", error);

                return {
                    data:
                        {
                            statistics:
                                {
                                    total_matches: 0,
                                    wins: 0,
                                    losses: 0,
                                    win_rate: 0,
                                    avg_score: 0
                                }
                        },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                };
            }
        },

        /**
         * Creates a new match
         */
        create_match: async (player2_id: number, game_type: string): Promise<AxiosResponse> =>
        {
            try
            {
                return await api_client.post("/api/matches", { player2_id, game_type }, {timeout: 30000});
            }
            catch (error)
            {
                console.error("Error creating match:", error);
                throw error;
            }
        },

        /**
         * Updates match result
         */
        update_match_result: async (match_id: number, player1_score: number, player2_score: number): Promise<AxiosResponse> =>
        {
            try
            {
                return await api_client.put("/api/matches/result", { match_id, player1_score, player2_score }, {timeout: 30000});
            }
            catch (error)
            {
                console.error("Error updating match result:", error);
                throw error;
            }
        }
    };


/**
 * GDPR-related API calls
 */
export const gdpr_api =
    {
        /**
         * Gets all user personal data for export
         */
        get_user_data: async (): Promise<AxiosResponse> =>
        {
            return api_client.get("/api/gdpr/data");
        },

        /**
         * Anonymizes the current user account
         */
        anonymize_user: async (): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/gdpr/anonymize");
        },

        /**
         * Permanently deletes the current user account
         */
        delete_account: async (confirm_password: string): Promise<AxiosResponse> =>
        {
            return api_client.post("/api/gdpr/delete-account", { confirm_password });
        }
    };