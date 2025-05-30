// Music room state management
const musicRooms = new Map();

const log = (message, data) => {
    console.log(`[MusicRoom] ${message}`, data || '');
};

export const setupMusicHandlers = (io, socket) => {
    // Join music room
    socket.on('join-music-room', (roomId) => {
        log('User joining room:', { roomId, socketId: socket.id });
        const roomChannel = `music:${roomId}`;
        socket.join(roomChannel);

        // Initialize room if it doesn't exist
        if (!musicRooms.has(roomId)) {
            log('Creating new room:', roomId);
            musicRooms.set(roomId, {
                participants: [],
                currentTrack: null,
                isPlaying: false,
                currentPosition: 0,
                lastUpdated: Date.now()
            });
        }

        const room = musicRooms.get(roomId);

        // Prevent duplicate participants
        if (!room.participants.includes(socket.id)) {
            room.participants.push(socket.id);
            log('Updated participants:', { roomId, participants: room.participants });
        }

        // Notify all clients about updated participants
        io.to(roomChannel).emit('participants-update', room.participants);

        // Send current state to new participant
        if (room.currentTrack) {
            const elapsedTime = (Date.now() - room.lastUpdated) / 1000;
            const currentPosition = room.isPlaying ?
                room.currentPosition + elapsedTime :
                room.currentPosition;

            log('Sending current state to new participant:', {
                track: room.currentTrack,
                isPlaying: room.isPlaying,
                position: currentPosition
            });

            socket.emit('music-state-update', {
                track: room.currentTrack,
                isPlaying: room.isPlaying,
                position: currentPosition
            });
        }
    });

    // Leave music room
    socket.on('leave-music-room', (roomId) => {
        log('User leaving room:', { roomId, socketId: socket.id });
        handleLeaveRoom(socket, roomId);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
        log('User disconnected:', socket.id);
        // Find and leave all rooms the socket was in
        for (const [roomId, room] of musicRooms.entries()) {
            if (room.participants.includes(socket.id)) {
                handleLeaveRoom(socket, roomId);
            }
        }
    });

    // Music state update (play/pause/track change)
    socket.on('music-state-update', ({ roomId, track, isPlaying, position }) => {
        log('Received music state update:', { roomId, track, isPlaying, position });
        const room = musicRooms.get(roomId);
        if (room) {
            room.currentTrack = track || room.currentTrack;
            room.isPlaying = isPlaying;
            room.currentPosition = position;
            room.lastUpdated = Date.now();

            // Broadcast to all clients in the room except sender
            log('Broadcasting music state update to room:', roomId);
            socket.to(`music:${roomId}`).emit('music-state-update', {
                track: room.currentTrack,
                isPlaying: room.isPlaying,
                position: room.currentPosition
            });
        }
    });

    // Handle seek
    socket.on('music-seek', ({ roomId, position }) => {
        log('Received seek request:', { roomId, position });
        const room = musicRooms.get(roomId);
        if (room) {
            room.currentPosition = position;
            room.lastUpdated = Date.now();

            // Broadcast to all clients in the room except sender
            log('Broadcasting seek event to room:', roomId);
            socket.to(`music:${roomId}`).emit('music-seek', { position });
        }
    });

    // Handle search query
    socket.on('search-query', ({ roomId, query }) => {
        log('Received search query:', { roomId, query });
        socket.to(`music:${roomId}`).emit('search-update', { query });
    });

    // Handle search results
    socket.on('search-update', ({ roomId, query, results }) => {
        log('Received search results:', { roomId, query, resultsCount: results.length });
        socket.to(`music:${roomId}`).emit('search-update', { query, results });
    });
};

// Helper function to handle room leaving
const handleLeaveRoom = (socket, roomId) => {
    const room = musicRooms.get(roomId);
    if (room) {
        room.participants = room.participants.filter(id => id !== socket.id);
        log('User left room:', { roomId, socketId: socket.id, remainingParticipants: room.participants });

        // Notify remaining participants
        socket.to(`music:${roomId}`).emit('participants-update', room.participants);

        // Clean up empty rooms
        if (room.participants.length === 0) {
            log('Removing empty room:', roomId);
            musicRooms.delete(roomId);
        }

        socket.leave(`music:${roomId}`);
    }
};

// Cleanup inactive rooms periodically
const CLEANUP_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour
const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of musicRooms.entries()) {
        if (room.participants.length === 0 && (now - room.lastUpdated) > INACTIVE_THRESHOLD) {
            log('Cleaning up inactive room:', roomId);
            musicRooms.delete(roomId);
        }
    }
}, CLEANUP_INTERVAL);