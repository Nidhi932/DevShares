import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';

function Room() {
    const { roomId } = useParams();
    const socket = useSocket();
    const videoRef = useRef();
    const streamRef = useRef();
    const [isSharing, setIsSharing] = useState(false);
    const [activeSharer, setActiveSharer] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const peerConnectionsRef = useRef({});

    const createPeerConnection = (viewerId) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                    recipientId: viewerId
                });
            }
        };

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, streamRef.current);
            });
        }

        return peerConnection;
    };

    useEffect(() => {
        if (!socket) return;

        socket.emit('join-room', roomId);

        socket.on('user-joined', ({ activeSharer: currentSharer, users }) => {
            setActiveSharer(currentSharer);
            setConnectedUsers(users);

            if (isSharing) {
                // Create connections for any new users that don't have one
                users.forEach(user => {
                    if (user.id !== socket.id && !peerConnectionsRef.current[user.id]) {
                        const peerConnection = createPeerConnection(user.id);
                        peerConnectionsRef.current[user.id] = peerConnection;

                        peerConnection.createOffer()
                            .then(offer => peerConnection.setLocalDescription(offer))
                            .then(() => {
                                socket.emit('offer', {
                                    roomId,
                                    offer: peerConnection.localDescription,
                                    recipientId: user.id
                                });
                            })
                            .catch(err => console.error('Error creating offer:', err));
                    }
                });
            }
        });

        socket.on('user-left', ({ users }) => {
            setConnectedUsers(users);
            // Cleanup connections for users who left
            Object.keys(peerConnectionsRef.current).forEach(userId => {
                if (!users.find(u => u.id === userId)) {
                    peerConnectionsRef.current[userId].close();
                    delete peerConnectionsRef.current[userId];
                }
            });
        });

        socket.on('sharer-changed', (sharerId) => {
            setActiveSharer(sharerId);
            if (!sharerId && isSharing) {
                stopSharing();
            }
        });

        socket.on('answer', async ({ answer, viewerId }) => {
            const peerConnection = peerConnectionsRef.current[viewerId];
            if (peerConnection) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error('Error setting remote description:', err);
                }
            }
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
            const peerConnection = peerConnectionsRef.current[senderId];
            if (peerConnection) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            }
        });

        return () => {
            if (isSharing) {
                stopSharing();
            }
            Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
            peerConnectionsRef.current = {};
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('sharer-changed');
            socket.off('answer');
            socket.off('ice-candidate');
        };
    }, [socket, roomId, isSharing]);

    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsSharing(true);
            socket.emit('start-sharing', { roomId });

            // Create peer connections for all existing users
            connectedUsers.forEach(user => {
                if (user.id !== socket.id) {
                    const peerConnection = createPeerConnection(user.id);
                    peerConnectionsRef.current[user.id] = peerConnection;

                    // Add tracks to the peer connection
                    stream.getTracks().forEach(track => {
                        peerConnection.addTrack(track, stream);
                    });

                    peerConnection.createOffer()
                        .then(offer => peerConnection.setLocalDescription(offer))
                        .then(() => {
                            socket.emit('offer', {
                                roomId,
                                offer: peerConnection.localDescription,
                                recipientId: user.id
                            });
                        })
                        .catch(err => console.error('Error creating offer:', err));
                }
            });

            stream.getVideoTracks()[0].onended = () => {
                stopSharing();
            };
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const stopSharing = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
        setIsSharing(false);
        socket.emit('stop-sharing', roomId);
    };

    const copyViewerLink = () => {
        const viewerUrl = `${window.location.origin}/view/${roomId}`;
        navigator.clipboard.writeText(viewerUrl);
        alert('Viewer link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium">DevShares</span>
                        <span className="text-white/40 text-sm">Room: {roomId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={copyViewerLink}
                            className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Share Link
                        </motion.button>
                        {!isSharing && !activeSharer && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startSharing}
                                className="bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                                </svg>
                                Share Screen
                            </motion.button>
                        )}
                        {isSharing && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={stopSharing}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Stop
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 pt-14 pb-12"
            >
                <div className="max-w-7xl mx-auto p-4 h-full">
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="relative h-full rounded-lg overflow-hidden bg-black border border-white/10"
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        {!videoRef.current?.srcObject && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-white/60 text-xl mb-4"
                                    >
                                        No active screen share
                                    </motion.div>
                                    <div className="text-white/40 text-sm">
                                        Click "Share Screen" to start sharing
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.main>

            {/* Footer */}
            <motion.footer
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {connectedUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs border border-white/10"
                                    title={user.id === socket.id ? 'You' : `User ${index + 1}`}
                                >
                                    {user.id === socket.id ? 'Y' : index + 1}
                                </motion.div>
                            ))}
                        </div>
                        <span className="text-white/40 text-sm">
                            {connectedUsers.length} connected
                        </span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/40 text-sm"
                    >
                        {activeSharer ? (
                            <span className="flex items-center gap-2">
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                ></motion.span>
                                Live Sharing
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                                Not Sharing
                            </span>
                        )}
                    </motion.div>
                </div>
            </motion.footer>
        </div>
    );
}

export default Room;