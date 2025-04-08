/**
 * frontend/tailwind.config.js
 *
 * This file configures Tailwind CSS for the frontend.
 * - content: Specifies which files to scan for Tailwind classes.
 * - theme: Allows customization of default styles.
 * - plugins: Can be used to add additional Tailwind plugins.
 *
 * @type {import('tailwindcss').Config}
 */


module.exports =
{
    content:
        [
            "./src/**/*.{js,jsx,ts,tsx}",
        ],
    theme:
        {
            extend: {},
        },
    plugins:
        [],
}
