/*
frontend/src/context/AuthenticationContext.tsx

This file provides the central authentication system for the application through React Context.
It defines the AuthenticationProvider component that wraps the application in index.tsx,
making authentication state and functions available throughout the component tree.
Manages user login, registration, 2FA verification, profile updates, token storage,
and real-time user online status tracking via WebSocket connections.
*/


import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authentication_api, user_api } from "../services/api";


/**
 * User data structure with basic profile information
 */
interface User
{
    id: number;
    username: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    is_online: boolean;
    wins: number;
    losses: number;
    two_factor_enabled: boolean;
    google_id?: string;
}


/**
 * User update data interface
 */
interface UserUpdate
{
    display_name?: string;
    email?: string;
    password?: string;
    current_password?: string;
}


/**
 * Authentication context state interface
 */
interface AuthenticationContextState
{
    is_authenticated: boolean;
    user: User | null;
    loading: boolean;
    requires_2fa: boolean;
    two_factor_user_id: number | null;
    error: string | null;
    login: (identifier: string, password: string) => Promise<boolean>;
    verify_2fa: (user_id: number, token: string) => Promise<boolean>;
    register: (username: string, email: string, password: string, display_name: string) => Promise<boolean>;
    register_google_user: (id_token: string) => Promise<boolean>;
    logout: () => void;
    refresh_user: () => Promise<void>;
    update_profile: (data: UserUpdate) => Promise<boolean>;
    upload_avatar: (file: File) => Promise<boolean>;
    check_user_online_status: (user_id: number) => boolean;
}


/**
 * Authentication context props interface
 */
interface AuthenticationProviderProps
{
    children: ReactNode;
}


/**
 * Create authentication context with default empty values
 */
const AuthenticationContext = createContext<AuthenticationContextState>
({
    is_authenticated: false,
    user: null,
    loading: true,
    requires_2fa: false,
    two_factor_user_id: null,
    error: null,
    login: async () => false,
    verify_2fa: async () => false,
    register: async () => false,
    register_google_user: async () => false,
    logout: () => {},
    refresh_user: async () => {},
    update_profile: async () => false,
    upload_avatar: async () => false,
    check_user_online_status: () => false
});


/**
 * Authentication context provider component
 */
export const AuthenticationProvider: React.FC<AuthenticationProviderProps> = ({ children }) =>
{
    const [user, set_user] = useState<User | null>(null);
    const [loading, set_loading] = useState<boolean>(true);
    const [is_authenticated, set_is_authenticated] = useState<boolean>(false);
    const [requires_2fa, set_requires_2fa] = useState<boolean>(false);
    const [two_factor_user_id, set_two_factor_user_id] = useState<number | null>(null);
    const [error, set_error] = useState<string | null>(null);
    const [status_socket, set_status_socket] = useState<WebSocket | null>(null);
    const [online_users, set_online_users] = useState<number[]>([]);


    /**
     * Initializes WebSocket connection for online status
     */
    const initialize_online_status = (token: string) =>
    {
        if (status_socket && status_socket.readyState === WebSocket.OPEN)
        {
            return status_socket;
        }

        /* CLOSE EXISTING SOCKET IF THERE IS ONE */
        if (status_socket)
        {
            status_socket.close();
        }

        try
        {
            /* USE EXPLICIT URL */
            const status_ws_url = `wss://localhost:3001/api/status/ws?token=${token}`;
            console.log("Connecting to WebSocket:", status_ws_url);

            const new_socket = new WebSocket(status_ws_url);

            new_socket.onopen = () =>
            {
                console.log("Online status WebSocket connected successfully");
                /* SEND A PING IMMEDIATELY TO ACTIVATE THE CONNECTION */
                new_socket.send(JSON.stringify({ type: "ping" }));

                fetch_online_users().catch(error =>
                {
                    console.error("Error fetching online users:", error);
                });
            };

            new_socket.onmessage = (event) =>
            {
                try
                {
                    const data = JSON.parse(event.data);
                    console.log("WebSocket message received:", data);

                    if (data.type === "status_update" || data.type === "friends_status")
                    {
                        fetch_online_users().catch(error =>
                        {
                            console.error("Error fetching online users:", error);
                        });
                    }
                }
                catch (error)
                {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            new_socket.onclose = (event) =>
            {
                console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
                set_status_socket(null);
            };

            new_socket.onerror = (error) =>
            {
                console.error("WebSocket error:", error);
            };

            set_status_socket(new_socket);
            return new_socket;
        }
        catch (error)
        {
            console.error("Failed to initialize status socket:", error);
            return null;
        }
    };


    /**
     * Fetch online users from the API
     */
    const fetch_online_users = async () =>
    {
        try
        {
            const response = await fetch("/api/status",
                {
                    headers:
                    {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });

            if (response.ok)
            {
                const data = await response.json();
                console.log("Fetched online users:", data.online_users);
                set_online_users(data.online_users || []);
            }
        }
        catch (error)
        {
            console.error("Error fetching online users:", error);
        }
    };


    /**
     * Check if a user is online
     */
    const check_user_online_status = (user_id: number): boolean =>
    {
        return online_users.includes(user_id);
    };


    /**
     * Logs in a user with provided credentials
     */
    const login = async (identifier: string, password: string): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            const response = await authentication_api.login(identifier, password);

            if (response.data.requires_2fa)
            {
                set_requires_2fa(true);
                set_two_factor_user_id(response.data.user_id);
                return true;
            }

            localStorage.setItem("token", response.data.token);
            set_is_authenticated(true);
            set_user(response.data.user);

            /* INITIALIZE ONLINE STATUS CONNECTION */
            initialize_online_status(response.data.token);

            if (response.data.user && response.data.user.id)
            {
                set_online_users(prev =>
                {
                    if (!prev.includes(response.data.user.id))
                    {
                        return [...prev, response.data.user.id];
                    }
                    return prev;
                });
            }

            return true;
        }
        catch (error: any)
        {
            console.error("Login failed:", error);
            set_error(error.response?.data?.error || "Login failed");
            return false;
        }
    };


    /**
     * Registers and logs in a user using Google credentials
     */
    const register_google_user = async (id_token: string): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            const response = await authentication_api.google_login(id_token);

            localStorage.setItem("token", response.data.token);
            set_is_authenticated(true);
            set_user(response.data.user);

            /* INITIALIZE ONLINE STATUS CONNECTION */
            initialize_online_status(response.data.token);

            if (response.data.user && response.data.user.id)
            {
                set_online_users(prev =>
                {
                    if (!prev.includes(response.data.user.id))
                    {
                        return [...prev, response.data.user.id];
                    }
                    return prev;
                });
            }

            return true;
        }
        catch (error: any)
        {
            console.error("Google login failed:", error);
            set_error(error.response?.data?.error || "Google login failed");
            return false;
        }
    };


    /**
     * Verifies 2FA token during login
     */
    const verify_2fa = async (user_id: number, token: string): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            const response = await authentication_api.verify_2fa(user_id, token);

            localStorage.setItem("token", response.data.token);
            set_is_authenticated(true);
            set_requires_2fa(false);
            set_two_factor_user_id(null);

            await refresh_user();

            /* INITIALIZE ONLINE STATUS CONNECTION */
            initialize_online_status(response.data.token);

            set_online_users(prev =>
            {
                if (!prev.includes(user_id))
                {
                    return [...prev, user_id];
                }
                return prev;
            });

            return true;
        }
        catch (error: any)
        {
            console.error("2FA verification failed:", error);
            set_error(error.response?.data?.error || "2FA verification failed");
            return false;
        }
    };


    /**
     * Registers a new user
     */
    const register = async (username: string, email: string, password: string, display_name: string): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            await authentication_api.register(username, email, password, display_name);
            return true;
        }
        catch (error: any)
        {
            console.error("Registration failed:", error);
            set_error(error.response?.data?.error || "Registration failed");
            return false;
        }
    };


    /**
     * Logs out the current user
     */
    const logout = (): void =>
    {
        /* CLOSE WEBSOCKET CONNECTION */
        if (status_socket)
        {
            status_socket.close();
            set_status_socket(null);
        }

        localStorage.clear();
        sessionStorage.clear();
        set_is_authenticated(false);
        set_user(null);
        set_error(null);
        set_online_users([]);

        window.location.reload();
    };


    /**
     * Refreshes the current user data
     */
    const refresh_user = async (): Promise<void> =>
    {
        if (!localStorage.getItem("token"))
            return;

        try
        {
            set_error(null);
            const { data } = await user_api.get_profile();
            set_user(data.user);
            set_is_authenticated(true);

            /* INITIALIZE ONLINE STATUS CONNECTION IF IT DOESN'T EXIST */
            const token = localStorage.getItem("token");
            if (token)
            {
                initialize_online_status(token);
            }

            if (data.user && data.user.id)
            {
                set_online_users(prev =>
                {
                    if (!prev.includes(data.user.id))
                    {
                        return [...prev, data.user.id];
                    }
                    return prev;
                });
            }
        }
        catch (error: any)
        {
            console.error("Failed to get user profile:", error);
            localStorage.removeItem("token");
            set_is_authenticated(false);
            set_user(null);
            set_error(error.response?.data?.error || "Failed to get user profile");
        }
    };


    /**
     * Updates user profile information
     */
    const update_profile = async (data: UserUpdate): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            const response = await user_api.update_profile(data);
            set_user(response.data.user);
            return true;
        }
        catch (error: any)
        {
            console.error("Failed to update profile:", error);
            set_error(error.response?.data?.error || "Failed to update profile");
            return false;
        }
    };


    /**
     * Uploads a user avatar
     */
    const upload_avatar = async (file: File): Promise<boolean> =>
    {
        try
        {
            set_error(null);
            const response = await user_api.upload_avatar(file);
            set_user(response.data.user);
            return true;
        }
        catch (error: any)
        {
            console.error("Failed to upload avatar:", error);
            set_error(error.response?.data?.error || "Failed to upload avatar");
            return false;
        }
    };


    /**
     * Check for existing token on initial load
     */
    useEffect(() =>
    {
        const check_authentication = async (): Promise<void> =>
        {
            try
            {
                console.log("Authentication check started");

                if (localStorage.getItem("token"))
                {
                    await refresh_user();

                    fetch_online_users().catch(error =>
                    {
                        console.error("Error fetching online users:", error);
                    });
                }
                else
                {
                    console.log("No token found, setting loading to false");
                }
            }
            catch (error)
            {
                console.error("Authentication check error:", error);
            }
            finally
            {
                set_loading(false);
            }

            /* FORCEER LOADING TE EINDIGEN NA 3 SECONDEN IN ALLE GEVALLEN */
            setTimeout(() => { console.log("Forcing loading to false after timeout"); set_loading(false);}, 3000);
        };

        check_authentication().catch((error) =>
        {
            console.error("Authentication check failed:", error);
            set_loading(false);
        });

        /* CLEANUP FUNCTION TO CLOSE WEBSOCKET ON UNMOUNT */
        return () =>
        {
            if (status_socket)
            {
                status_socket.close();
            }
        };
    }, []);


    const value =
        {
            is_authenticated,
            user,
            loading,
            requires_2fa,
            two_factor_user_id,
            error,
            login,
            verify_2fa,
            register,
            register_google_user,
            logout,
            refresh_user,
            update_profile,
            upload_avatar,
            check_user_online_status
        };


    return (
        <AuthenticationContext.Provider value={value}>
            {children}
        </AuthenticationContext.Provider>
    );
};


/**
 * Custom hook to use the authentication context
 */
export const use_authentication = (): AuthenticationContextState =>
{
    return useContext(AuthenticationContext);
};


export default AuthenticationProvider;
