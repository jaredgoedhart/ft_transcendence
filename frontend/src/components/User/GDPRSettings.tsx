/*
frontend/src/components/User/GDPRSettings.tsx

This file contains the component for GDPR compliance features.
Provides options for downloading personal data, anonymizing accounts,
and permanent account deletion with appropriate confirmations and warnings.
Ensures user privacy rights in accordance with data protection regulations.
*/


import React, { useState } from "react";
import { use_authentication } from "../../context/AuthenticationContext";
import { gdpr_api } from "../../services/api";


/**
 * Component for GDPR-related settings and actions
 */
const GDPRSettings: React.FC = () =>
{
    const { user, logout } = use_authentication();
    const [loading_data, set_loading_data] = useState<boolean>(false);
    const [anonymizing, set_anonymizing] = useState<boolean>(false);
    const [deleting, set_deleting] = useState<boolean>(false);
    const [confirmation_password, set_confirmation_password] = useState<string>("");
    const [show_delete_form, set_show_delete_form] = useState<boolean>(false);
    const [error, set_error] = useState<string>("");
    const [success_message, set_success_message] = useState<string>("");


    /**
     * Handles downloading all user data
     */
    const handle_download_data = async (): Promise<void> =>
    {
        try
        {
            set_loading_data(true);
            set_error("");

            const response = await gdpr_api.get_user_data();

            /* CREATE DOWNLOADABLE JSON FILE */
            const blob = new Blob([JSON.stringify(response.data.user_data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my_personal_data.json";
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            set_success_message("Data downloaded successfully");
        }
        catch (error)
        {
            console.error("Error downloading data:", error);
            set_error("Failed to download your data. Please try again later.");
        }
        finally
        {
            set_loading_data(false);

            if (success_message)
            {
                setTimeout(() => set_success_message(""), 5000);
            }
        }
    };


    /**
     * Handles anonymizing the user account
     */
    const handle_anonymize_account = async (): Promise<void> =>
    {
        if (!window.confirm("Are you sure you want to anonymize your account? This cannot be undone."))
        {
            return;
        }

        try
        {
            set_anonymizing(true);
            set_error("");

            await gdpr_api.anonymize_user();

            set_success_message("Your account has been anonymized successfully. You will be logged out.");

            setTimeout(() =>
            {
                logout();
            }, 3000);
        }
        catch (error)
        {
            console.error("Error anonymizing account:", error);
            set_error("Failed to anonymize your account. Please try again later.");
        }
        finally
        {
            set_anonymizing(false);
        }
    };


    /**
     * Handles account deletion
     */
    const handle_delete_account = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();

        if (!confirmation_password)
        {
            set_error("Please enter your password to confirm deletion");
            return;
        }

        try
        {
            set_deleting(true);
            set_error("");

            await gdpr_api.delete_account(confirmation_password);

            set_success_message("Your account has been deleted successfully. You will be logged out.");

            setTimeout(() =>
            {
                logout();
            }, 3000);
        }
        catch (error: any)
        {
            console.error("Error deleting account:", error);
            set_error(error.response?.data?.error || "Failed to delete your account. Please try again later.");
        }
        finally
        {
            set_deleting(false);
        }
    };


    if (!user)
        return null;


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Privacy and Data Settings</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success_message && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                    {success_message}
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Your Personal Data</h3>
                <p className="text-gray-600 mb-4">
                    Under the General Data Protection Regulation (GDPR), you have the right to access,
                    receive, and port your personal data.
                </p>

                <button
                    onClick={handle_download_data}
                    disabled={loading_data}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading_data ? "Downloading..." : "Download My Data"}
                </button>
            </div>

            <div className="mb-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Anonymize Account</h3>
                <p className="text-gray-600 mb-4">
                    This option removes your personal information but keeps your game history.
                    Your account will be anonymized and you will be logged out.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
                    <p className="text-yellow-700 font-medium">Warning:</p>
                    <p className="text-yellow-600 text-sm">
                        This action cannot be undone. Your personal information will be removed,
                        but your matches and game statistics will remain in our system without
                        being linked to your identity.
                    </p>
                </div>

                <button
                    onClick={handle_anonymize_account}
                    disabled={anonymizing}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                    {anonymizing ? "Anonymizing..." : "Anonymize My Account"}
                </button>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Delete Account</h3>
                <p className="text-gray-600 mb-4">
                    This permanently deletes your account and all associated data.
                </p>

                <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                    <p className="text-red-700 font-medium">Warning:</p>
                    <p className="text-red-600 text-sm">
                        This action cannot be undone. All your personal data, match history,
                        and other information will be permanently deleted from our system.
                    </p>
                </div>

                {!show_delete_form ? (
                    <button
                        onClick={() => set_show_delete_form(true)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Delete My Account
                    </button>
                ) : (
                    <form onSubmit={handle_delete_account} className="bg-gray-50 p-4 rounded">
                        <p className="mb-4 font-medium">Please enter your password to confirm account deletion:</p>
                        <div className="mb-4">
                            <input
                                type="password"
                                value={confirmation_password}
                                onChange={(e) => set_confirmation_password(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={deleting}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Confirm Deletion"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    set_show_delete_form(false);
                                    set_confirmation_password("");
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GDPRSettings;
