/*
frontend/src/components/Game/InputValidation.ts

This file contains utility functions for validating and sanitizing user input.
Prevents XSS attacks by converting special characters to HTML entities
and ensures user-provided content is safe for display and storage.
*/


/**
 * Sanitizes input string by replacing special characters with HTML entities
 * Prevents XSS attacks by converting characters like < > " to their HTML entity equivalents
 * so they display as text rather than being interpreted as code by the browser
 *
 * Example:
 *   Input:  '<script>alert("hack");</script>'
 *   Output: '&lt;script&gt;alert(&quot;hack&quot;);&lt;/script&gt;'
 */
export const sanitize_input = (input: string): string =>
{
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
