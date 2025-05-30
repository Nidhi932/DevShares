import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../config/config';

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
};

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        const newSocket = io(SERVER_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnecting(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnecting(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnecting(true);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    if (isConnecting) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-lg">Connecting to server...</div>
            </div>
        );
    }

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}