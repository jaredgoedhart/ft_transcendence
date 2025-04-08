/*
frontend/src/components/Auth/LoginForm.tsx

This component handles user login, including:
- Username/password login
- Two-factor authentication (2FA)
- Google sign-in

It manages form state, validation, and error handling.
*/



import React, { useState } from "react";
import { use_authentication } from "../../context/AuthenticationContext";
import GoogleSignIn from "./GoogleSignIn";


interface LoginFormProps
{
    on_login_success: () => void;
}


/**
 * Component for user login
 */
const LoginForm: React.FC<LoginFormProps> = ({ on_login_success }) =>
{
    const [identifier, set_identifier] = useState<string>("");
    const [password, set_password] = useState<string>("");
    const [two_factor_code, set_two_factor_code] = useState<string>("");
    const [error, set_error] = useState<string>("");
    const [loading, set_loading] = useState<boolean>(false);
    const { login, verify_2fa, requires_2fa, two_factor_user_id } = use_authentication();


    /**
     * Handles form submission for login
     */
    const handle_submit = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();
        set_error("");

        if (!identifier || !password)
        {
            set_error("Username/Email and password are required");
            return;
        }

        set_loading(true);

        try
        {
            const success = await login(identifier, password);

            if (!success)
            {
                set_error("Invalid credentials");
                set_loading(false);
                return;
            }

            if (!requires_2fa)
            {
                on_login_success();
            }
        }
        catch (error)
        {
            set_error("An error occurred during login");
            console.error("Login error:", error);
        }

        set_loading(false);
    };


    /**
     * Handles 2FA verification
     */
    const handle_verify_2fa = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();
        set_error("");

        if (!two_factor_code || !two_factor_user_id)
        {
            set_error("2FA code is required");
            return;
        }

        set_loading(true);

        try
        {
            const success = await verify_2fa(two_factor_user_id, two_factor_code);

            if (!success)
            {
                set_error("Invalid 2FA code");
                set_loading(false);
                return;
            }

            on_login_success();
        }
        catch (error)
        {
            set_error("An error occurred during 2FA verification");
            console.error("2FA error:", error);
        }

        set_loading(false);
    };


    /**
     * Renders the login form or 2FA form based on the authentication state
     */
    if (requires_2fa)
    {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Two-Factor Authentication</h2>

                <form onSubmit={handle_verify_2fa}>
                    <div className="mb-4">
                        <label htmlFor="two_factor_code" className="block text-gray-700 mb-2">
                            Enter the 6-digit code from your authenticator app
                        </label>
                        <input
                            type="text"
                            id="two_factor_code"
                            value={two_factor_code}
                            onChange={(e) => set_two_factor_code(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123456"
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>

                    {error && <div className="mb-4 text-red-500">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        );
    }


    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            <form onSubmit={handle_submit}>
                <div className="mb-4">
                    <label htmlFor="identifier" className="block text-gray-700 mb-2">
                        Username or Email
                    </label>
                    <input
                        type="text"
                        id="identifier"
                        value={identifier}
                        onChange={(e) => set_identifier(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your username or email"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => set_password(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                    />
                </div>

                {error && <div className="mb-4 text-red-500">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <GoogleSignIn on_success={on_login_success} />
        </div>
    );
};


export default LoginForm;
