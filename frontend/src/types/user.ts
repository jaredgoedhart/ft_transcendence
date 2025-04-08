// FRONTEND: frontend/src/types/user.ts


/**
 * User model from the API
 */
export interface User
{
    id: number;
    username: string;
    display_name: string;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    online_status: 'online' | 'offline' | 'in_game';
    wins: number;
    losses: number;
}


/**
 * User registration data
 */
export interface UserRegistration
{
    username: string;
    password: string;
    display_name?: string;
}


/**
 * User login credentials
 */
export interface UserCredentials
{
    username: string;
    password: string;
}


/**
 * User profile update data
 */
export interface UserUpdate
{
    display_name?: string;
    password?: string;
    current_password?: string; /* For verification when changing password */
    avatar?: string;
}


/**
 * Friend model from the API
 */
export interface Friend
{
    id: number;
    username: string;
    display_name: string;
    avatar: string | null;
    online_status: 'online' | 'offline' | 'in_game';
    since: string;
}


/**
 * Game history record
 */
export interface GameRecord
{
    id: number;
    player1_id: number;
    player2_id: number;
    player1_score: number;
    player2_score: number;
    winner_id: number | null;
    started_at: string;
    ended_at: string | null;
    player1_name: string;
    player1_display_name: string;
    player2_name: string;
    player2_display_name: string;
    winner_name: string | null;
    winner_display_name: string | null;
}


/**
 * Chat message (for future implementation)
 */
export interface ChatMessage
{
    id: number;
    sender_id: number;
    recipient_id?: number;
    room_id?: string;
    content: string;
    timestamp: string;
    read: boolean;
}


/**
 * Game invitation (for future implementation)
 */
export interface GameInvite
{
    id: number;
    sender_id: number;
    recipient_id: number;
    game_type: 'pong';
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    created_at: string;
    expires_at: string;
}


/**
 * 2FA credentials (for future implementation)
 */
export interface TwoFactorCredentials
{
    secret: string;
    qrCode: string;
    backupCodes: string[];
    enabled: boolean;
}