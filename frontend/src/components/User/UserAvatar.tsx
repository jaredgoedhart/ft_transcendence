/*
frontend/src/components/User/UserAvatar.tsx

This file contains the user avatar component. It displays the user's avatar,
allows uploading a new avatar, and handles validation for image type and size.
It also shows an upload status and error messages if necessary.
*/


import React, { useState, useRef } from "react";


interface UserAvatarProperties
{
    avatar_url: string | null;
    display_name: string;
    is_editable: boolean | null;
    on_upload: (file: File) => Promise<void>;
}


/**
 * Component for displaying and uploading user avatars
 */
const UserAvatar: React.FC<UserAvatarProperties> = ({ avatar_url, display_name, is_editable, on_upload }) =>
{
    const [uploading, set_uploading] = useState<boolean>(false);
    const [error, set_error] = useState<string>("");
    const file_input_ref = useRef<HTMLInputElement>(null);


    /**
     * Gets the first initial of the display name
     */
    const get_initial = (): string =>
    {
        return display_name ? display_name.charAt(0).toUpperCase() : "U";
    };


    /**
     * Handles clicking the avatar to upload a new one
     */
    const handle_avatar_click = (): void =>
    {
        if (is_editable && file_input_ref.current)
        {
            file_input_ref.current.click();
        }
    };


    /**
     * Handles file selection for avatar upload
     */
    const handle_file_change = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> =>
    {
        const files = event.target.files;

        if (!files || files.length === 0)
            return;

        const file = files[0];

        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type))
        {
            set_error("Please select a valid image file (JPEG, PNG, or GIF)");
            return;
        }

        if (file.size > 5 * 1024 * 1024)
        {
            set_error("Image file must be smaller than 5MB");
            return;
        }

        try
        {
            set_uploading(true);
            set_error("");

            await on_upload(file);
        }
        catch (upload_error)
        {
            console.error("Avatar upload error:", upload_error);
            set_error("Failed to upload avatar");
        }
        finally
        {
            set_uploading(false);

            /* CLEAR THE FILE INPUT */
            if (file_input_ref.current)
                file_input_ref.current.value = "";
        }
    };


    return (
        <div className="relative">
            <div
                onClick={handle_avatar_click}
                className={`
                    h-32 w-32 rounded-full overflow-hidden flex items-center justify-center
                    bg-gray-200 text-gray-600 text-5xl font-bold
                    ${is_editable ? "cursor-pointer hover:opacity-80" : ""}
                `}
                title={is_editable ? "Click to upload new avatar" : display_name}
            >
                {avatar_url ? (
                    <img
                        src={avatar_url && avatar_url.startsWith('/') ?
                            `https://localhost${avatar_url}` : avatar_url}
                        alt={`${display_name}'s avatar`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span>{get_initial()}</span>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-sm">Uploading...</div>
                    </div>
                )}

                {is_editable && (
                    <div className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full text-white">
                        <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {is_editable && (
                <input
                    type="file"
                    ref={file_input_ref}
                    onChange={handle_file_change}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                />
            )}

            {error && (
                <div className="mt-2 text-sm text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};


export default UserAvatar;
