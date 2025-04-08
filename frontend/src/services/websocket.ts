/*
frontend/src/services/websocket.ts

Manages WebSocket connections for real-time events in the application.
Establishes the connection via a URL and handles events like game updates,
player actions, and connection status.
*/


export enum WebSocketEvent
{
    ERROR = 'error',
    /* UNUSED:
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    GAME_JOIN = 'game:join',
    GAME_LEAVE = 'game:leave',
    GAME_UPDATE = 'game:update',
    GAME_OVER = 'game:over',
    PADDLE_MOVE = 'paddle:move',
    PLAYER_READY = 'player:ready',
    */
}


interface WebSocketMessage
{
    event: WebSocketEvent;
    data?: any;
}


type MessageHandler = (data: any) => void;


class WebSocketService
{
    private socket: WebSocket | null = null;
    private readonly url: string;
    private readonly handlers: Map<WebSocketEvent, Set<MessageHandler>> = new Map();
    private reconnect_attempts = 0;
    private readonly max_reconnect_attempts = 5;
    private reconnect_timeout = 1000;

    constructor(url: string)
    {
        this.url = url;
    }

    public connect(): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            if (this.socket && this.socket.readyState === WebSocket.OPEN)
            {
                resolve();
                return;
            }

            this.socket = new WebSocket(this.url);

            this.socket.onopen = () =>
            {
                console.log('WebSocket connected');
                this.reconnect_attempts = 0;
                this.reconnect_timeout = 1000;
                resolve();
            };

            this.socket.onclose = (event) =>
            {
                console.log('WebSocket closed:', event);
                this.handle_reconnect();
            };

            this.socket.onerror = (error) =>
            {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.socket.onmessage = (event) =>
            {
                try
                {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.handle_message(message);
                }
                catch (error)
                {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        });
    }

    private handle_reconnect(): void
    {
        if (this.reconnect_attempts < this.max_reconnect_attempts)
        {
            this.reconnect_attempts++;
            console.log(`Attempting to reconnect (${this.reconnect_attempts}/${this.max_reconnect_attempts})...`);

            setTimeout(() =>
            {
                void this.connect().catch(console.error);
            }, this.reconnect_timeout);

            this.reconnect_timeout = Math.min(this.reconnect_timeout * 2, 30000);
        }
        else
        {
            console.error('Max reconnect attempts reached');
            const handlers = this.handlers.get(WebSocketEvent.ERROR);
            if (handlers)
            {
                handlers.forEach(handler => handler({ message: 'Connection lost' }));
            }
        }
    }

    private handle_message(message: WebSocketMessage): void
    {
        const handlers = this.handlers.get(message.event);
        if (handlers)
        {
            handlers.forEach(handler => handler(message.data));
        }
    }

    public on(event: WebSocketEvent, handler: MessageHandler): void
    {
        if (!this.handlers.has(event))
        {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)?.add(handler);
    }

    public off(event: WebSocketEvent, handler: MessageHandler): void
    {
        const handlers = this.handlers.get(event);
        if (handlers)
        {
            handlers.delete(handler);
        }
    }

    public send(event: WebSocketEvent, data?: any): void
    {
        if (this.socket && this.socket.readyState === WebSocket.OPEN)
        {
            const message: WebSocketMessage = { event, data };
            this.socket.send(JSON.stringify(message));
        }
        else
        {
            console.error('WebSocket not connected');
        }
    }

    public disconnect(): void
    {
        if (this.socket)
        {
            this.socket.close();
            this.socket = null;
        }
    }
}


const ws_url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/socket.io`;
const websocket_service = new WebSocketService(ws_url);


export default websocket_service;
