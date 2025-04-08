/*
frontend/src/components/User/TwoFactorSettings.tsx

This file contains the component for Two-Factor Authentication (2FA) management.
Provides users with the ability to enable, disable, and configure two-factor authentication

for enhanced account security. The component handles the entire 2FA setup process, including:
- Generating QR codes for authenticator apps
- Verifying setup tokens
- Enabling and disabling two-factor authentication
- Displaying security status and guidance

Ensures a comprehensive and user-friendly approach to account security settings.
*/


import React, { useState, useEffect } from "react";
import { two_factor_api } from "../../services/api";
import { use_authentication } from "../../context/AuthenticationContext";


/**
 * Component for managing two-factor authentication settings
 */
const TwoFactorSettings: React.FC = () =>
{
    const { user, refresh_user } = use_authentication();
    const [qr_code_url, set_qr_code_url] = useState<string>("");
    const [secret, set_secret] = useState<string>("");
    const [token, set_token] = useState<string>("");
    const [loading, set_loading] = useState<boolean>(false);
    const [setup_mode, set_setup_mode] = useState<boolean>(false);
    const [error, set_error] = useState<string>("");
    const [success_message, set_success_message] = useState<string>("");


    /**
     * Initiates the 2FA setup process
     */
    const start_2fa_setup = async (): Promise<void> =>
    {
        try
        {
            set_loading(true);
            set_error("");

            const response = await two_factor_api.generate_setup();

            set_qr_code_url(response.data.data.qr_code_url);
            set_secret(response.data.data.secret);
            set_setup_mode(true);
        }
        catch (error)
        {
            console.error("Error generating 2FA setup:", error);
            set_error("Failed to generate 2FA setup");
        }
        finally
        {
            set_loading(false);
        }
    };


    /**
     * Handles enabling 2FA after verification
     */
    const handle_enable_2fa = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();

        if (!token)
        {
            set_error("Please enter the verification code");
            return;
        }

        try
        {
            set_loading(true);
            set_error("");

            await two_factor_api.enable_2fa(token);

            await refresh_user();
            set_success_message("Two-factor authentication has been enabled");
            set_setup_mode(false);
            set_token("");
        }
        catch (error)
        {
            console.error("Error enabling 2FA:", error);
            set_error("Failed to enable 2FA. Verification code may be invalid.");
        }
        finally
        {
            set_loading(false);
        }
    };


    /**
     * Handles disabling 2FA
     */
    const handle_disable_2fa = async (): Promise<void> =>
    {
        if (!window.confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure."))
            return;

        try
        {
            set_loading(true);
            set_error("");
            set_success_message("");

            await two_factor_api.disable_2fa();

            await refresh_user();
            set_success_message("Two-factor authentication has been disabled");
        }
        catch (error)
        {
            console.error("Error disabling 2FA:", error);
            set_error("Failed to disable 2FA");
        }
        finally
        {
            set_loading(false);
        }
    };


    /**
     * Clears messages after a timeout
     */
    useEffect(() =>
    {
        if (success_message)
        {
            const timer = setTimeout(() => {
                set_success_message("");
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [success_message]);


    if (!user)
        return null;


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

            {user.two_factor_enabled ? (
                <div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
                        <div className="flex items-center">
                            <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-medium">Two-factor authentication is enabled</span>
                        </div>
                        <p className="text-green-600 mt-2 text-sm">
                            Your account is more secure. You will need to enter a verification code from your authenticator app when logging in.
                        </p>
                    </div>

                    <button
                        onClick={handle_disable_2fa}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? "Disabling..." : "Disable Two-Factor Authentication"}
                    </button>
                </div>
            ) : setup_mode ? (
                <div>
                    <p className="mb-4">
                        Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                    </p>

                    {qr_code_url && (
                        <div className="mb-4 flex justify-center">
                            <img src={qr_code_url} alt="QR Code for 2FA setup" className="border p-2" />
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Or enter this code manually in your authenticator app:</p>
                        <div className="bg-gray-100 p-2 rounded font-mono text-center select-all">
                            {secret}
                        </div>
                    </div>

                    <form onSubmit={handle_enable_2fa} className="mt-6">
                        <div className="mb-4">
                            <label htmlFor="token" className="block text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="token"
                                value={token}
                                onChange={(e) => set_token(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the 6-digit code"
                                maxLength={6}
                                autoComplete="one-time-code"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Enable Two-Factor Authentication"}
                            </button>
                            <button
                                type="button"
                                onClick={() => set_setup_mode(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                        <div className="flex items-center">
                            <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-700 font-medium">Two-factor authentication is not enabled</span>
                        </div>
                        <p className="text-yellow-600 mt-2 text-sm">
                            Your account is less secure. We recommend enabling two-factor authentication for additional security.
                        </p>
                    </div>

                    <button
                        onClick={start_2fa_setup}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Setup Two-Factor Authentication"}
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}

            {success_message && (
                <div className="mt-4 text-green-500">
                    {success_message}
                </div>
            )}
        </div>
    );
};


export default TwoFactorSettings;
