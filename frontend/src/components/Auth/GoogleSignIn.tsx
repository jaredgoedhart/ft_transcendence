/*
frontend/src/components/Auth/GoogleSignIn.tsx

This file contains the component for Google authentication integration.
Handles loading the Google Identity Services script, rendering the sign-in button,
and processing authentication responses from Google. Provides a seamless
third-party authentication option for users.
*/


import React, { useEffect, useState } from "react";
import { use_authentication } from "../../context/AuthenticationContext";


interface GoogleSignInProperties
{
    on_success: () => void;
}


/**
 * Component for handling Google authentication
 */
const GoogleSignIn: React.FC<GoogleSignInProperties> = ({ on_success }) =>
{
    const [loading, set_loading] = useState<boolean>(false);
    const [error, set_error] = useState<string>("");
    const { register_google_user } = use_authentication();

    /**
     * Initializes Google Identity Services
     */
    useEffect(() =>
    {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initialize_google_auth;
        document.body.appendChild(script);

        return () =>
        {
            document.body.removeChild(script);
        };
    }, []);

    /**
     * Sets up Google authentication
     */
    const initialize_google_auth = () =>
    {
        if (typeof window.google === "undefined")
            return;

        window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "",
            callback: handle_credential_response,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
            document.getElementById("google_sign_in_button") as HTMLElement,
            {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "continue_with",
                logo_alignment: "center",
            }
        );
    };

    /**
     * Processes the credential received from Google
     */
    const handle_credential_response = async (response: any) =>
    {
        try
        {
            set_loading(true);
            set_error("");

            const id_token = response.credential;

            const success = await register_google_user(id_token);

            if (success)
            {
                on_success();
            }
            else
            {
                set_error("Failed to authenticate with Google");
            }
        }
        catch (error: any)
        {
            console.error("Google authentication error:", error);
            set_error("Authentication failed: " + (error.message || "Unknown error"));
        }
        finally
        {
            set_loading(false);
        }
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-6">
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                {loading && <div className="mb-4 text-gray-500 text-center">Authenticating...</div>}
                <div id="google_sign_in_button" className="flex justify-center"></div>
            </div>
        </div>
    );
};


export default GoogleSignIn;


/**
 * Extend Window interface to include Google Identity Services
 */
declare global
{
    interface Window
    {
        google?:
        {
            accounts:
            {
                id:
                {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, options: any) => void;
                    prompt: () => void;
                }
            }
        }
    }
}
