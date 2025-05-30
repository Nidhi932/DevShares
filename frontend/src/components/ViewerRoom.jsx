import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';

function ViewerRoom() {
    const { roomId } = useParams();
    const socket = useSocket();
    const videoRef = useRef();
    const peerConnectionRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const createPeerConnection = (sharerId) => {
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            peerConnection.ontrack = (event) => {
                console.log('Received track:', event);
                if (videoRef.current && event.streams[0]) {
                    videoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        roomId,
                        candidate: event.candidate,
                        recipientId: sharerId
                    });
                }
            };

            return peerConnection;
        };

        socket.emit('join-room', roomId);

        socket.on('offer', async ({ offer, sharerId }) => {
            try {
                // Close existing connection if any
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }

                const peerConnection = createPeerConnection(sharerId);
                peerConnectionRef.current = peerConnection;

                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit('answer', {
                    roomId,
                    answer,
                    sharerId
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        socket.on('sharer-changed', (sharerId) => {
            if (!sharerId && peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
        });

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            socket.off('offer');
            socket.off('ice-candidate');
            socket.off('sharer-changed');
        };
    }, [socket, roomId]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black"
        >
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
                    <span className="text-white font-medium">DevShares Viewer</span>
                    <span className="text-white/40 text-sm ml-4">Room: {roomId}</span>
                </div>
            </motion.nav>

            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="h-full pt-14"
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
                                Waiting for screen share...
                            </motion.div>
                            <div className="text-white/40 text-sm">
                                The presenter will start sharing soon
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default ViewerRoom;