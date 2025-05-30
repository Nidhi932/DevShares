import express from 'express';
const router = express.Router();

// Store active music rooms
const musicRooms = new Map();

// Create a new music room
router.post('/create', (req, res) => {
    const roomId = Math.random().toString(36).substring(7);

    musicRooms.set(roomId, {
        participants: [],
        currentTrack: null,
        isPlaying: false,
        currentPosition: 0,
        lastUpdated: Date.now()
    });

    res.json({
        success: true,
        roomId,
        room: {
            ...musicRooms.get(roomId),
            participantCount: 0
        }
    });
});

// Get all active rooms
router.get('/rooms', (req, res) => {
    const rooms = Array.from(musicRooms.entries()).map(([id, room]) => ({
        id,
        ...room,
        participantCount: room.participants.length
    }));
    res.json({
        success: true,
        rooms
    });
});

// Get specific room details
router.get('/room/:roomId', (req, res) => {
    const room = musicRooms.get(req.params.roomId);
    if (!room) {
        return res.status(404).json({
            success: false,
            error: 'Room not found'
        });
    }

    res.json({
        success: true,
        room: {
            ...room,
            participantCount: room.participants.length
        }
    });
});

// Join a room
router.post('/room/:roomId/join', (req, res) => {
    const room = musicRooms.get(req.params.roomId);
    if (!room) {
        return res.status(404).json({
            success: false,
            error: 'Room not found'
        });
    }

    res.json({
        success: true,
        room: {
            ...room,
            participantCount: room.participants.length
        }
    });
});

// Cleanup inactive rooms periodically
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of musicRooms.entries()) {
        if (room.participants.length === 0 && (now - room.lastUpdated) > INACTIVE_THRESHOLD) {
            musicRooms.delete(roomId);
        }
    }
}, CLEANUP_INTERVAL);

export { router, musicRooms };