/*
frontend/src/components/Auth/RegisterForm.tsx

This file contains the registration form component for new user accounts.
Handles username, email, password, and display name inputs with comprehensive
validation, including password strength requirements and duplicate checks.
Provides feedback to users during the registration process.
*/


import React, { useState } from "react";
import { use_authentication } from "../../context/AuthenticationContext";


interface RegisterFormProps
{
    on_register_success: () => void;
}


/**
 * Component for user registration
 */
const RegisterForm: React.FC<RegisterFormProps> = ({ on_register_success }) =>
{
    const [username, set_username] = useState<string>("");
    const [email, set_email] = useState<string>("");
    const [password, set_password] = useState<string>("");
    const [confirm_password, set_confirm_password] = useState<string>("");
    const [display_name, set_display_name] = useState<string>("");
    const [error, set_error] = useState<string>("");
    const [success_message, set_success_message] = useState<string>("");
    const [loading, set_loading] = useState<boolean>(false);

    const { register } = use_authentication();


    /**
     * Validates user input
     */
    const validate_input = (): boolean =>
    {
        if (!username || !email || !password || !confirm_password || !display_name)
        {
            set_error("All fields are required");
            return false;
        }

        if (username.length < 3)
        {
            set_error("Username must be at least 3 characters long");
            return false;
        }

        if (username.length > 20)
        {
            set_error("Username must be at most 20 characters long");
            return false;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username))
        {
            set_error("Username can only contain letters, numbers, hyphens and underscores");
            return false;
        }

        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_regex.test(email))
        {
            set_error("Please enter a valid email address");
            return false;
        }

        if (password.length < 8)
        {
            set_error("Password must be at least 8 characters long");
            return false;
        }

        if (password.includes(' ') || password.includes('\t'))
        {
            set_error("Password cannot contain spaces or tabs");
            return false;
        }

        if (!/[A-Z]/.test(password))
        {
            set_error("Password must contain at least one uppercase letter");
            return false;
        }

        if (!/[a-z]/.test(password))
        {
            set_error("Password must contain at least one lowercase letter");
            return false;
        }

        if (!/[0-9]/.test(password))
        {
            set_error("Password must contain at least one number");
            return false;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        {
            set_error("Password must contain at least one special character");
            return false;
        }

        if (password !== confirm_password)
        {
            set_error("Passwords don't match");
            return false;
        }

        if (display_name.length < 2)
        {
            set_error("Display name must be at least 2 characters long");
            return false;
        }

        if (display_name.length > 30)
        {
            set_error("Display name must be at most 30 characters long");
            return false;
        }

        return true;
    };


    /**
     * Handles form submission for registration
     */
    const handle_submit = async (event: React.FormEvent): Promise<void> =>
    {
        event.preventDefault();
        set_error("");
        set_success_message("");

        if (!validate_input())
            return;

        set_loading(true);

        try
        {
            const success = await register(username, email, password, display_name);

            if (success)
            {
                set_success_message("Account successfully created! You can now log in.");

                setTimeout(() => { on_register_success(); }, 4000);
            }
            else
            {
                set_error("Registration failed. Username or email may already be in use.");
            }
        }
        catch (error)
        {
            set_error("An error occurred during registration");
            console.error("Registration error:", error);
        }

        set_loading(false);
    };


    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

            <form onSubmit={handle_submit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => set_username(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Choose a username"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => set_email(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="display_name" className="block text-gray-700 mb-2">
                        Display Name
                    </label>
                    <input
                        type="text"
                        id="display_name"
                        value={display_name}
                        onChange={(e) => set_display_name(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="How you want to be known"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => set_password(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Create a password"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="confirm_password" className="block text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirm_password"
                        value={confirm_password}
                        onChange={(e) => set_confirm_password(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm your password"
                    />
                </div>

                {error && <div className="mb-4 text-red-500">{error}</div>}
                {success_message && <div className="mb-4 text-green-500">{success_message}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>
            </form>
        </div>
    );
};


export default RegisterForm;
