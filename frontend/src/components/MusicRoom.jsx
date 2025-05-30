import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('MusicRoom error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                            <p>Please try refreshing the page.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const MusicRoom = () => {
    const { roomId } = useParams();
    const socket = useSocket();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const playerRef = useRef(null);
    const progressInterval = useRef(null);
    const isPlayerReady = useRef(false);
    const pendingTrackRef = useRef(null);

    // Initialize YouTube API
    useEffect(() => {
        let isMounted = true;

        const initYouTube = async () => {
            try {
                if (window.YT) {
                    if (isMounted) {
                        initializeYouTubePlayer();
                    }
                } else {
                    const tag = document.createElement('script');
                    tag.src = 'https://www.youtube.com/iframe_api';
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                    window.onYouTubeIframeAPIReady = () => {
                        if (isMounted) {
                            initializeYouTubePlayer();
                        }
                    };
                }
            } catch (error) {
                console.error('Error initializing YouTube player:', error);
                if (isMounted) {
                    setError('Failed to initialize YouTube player');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initYouTube();

        return () => {
            isMounted = false;
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying player:', error);
                }
            }
        };
    }, []);

    const initializeYouTubePlayer = () => {
        console.log('Initializing YouTube player');
        playerRef.current = new window.YT.Player('youtube-player', {
            height: '360',
            width: '640',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    };

    // Socket connection effect
    useEffect(() => {
        if (!socket || !roomId) {
            console.log('Missing socket or roomId:', { socket: !!socket, roomId });
            return;
        }

        console.log('Joining music room:', roomId);
        socket.emit('join-music-room', roomId);

        socket.on('participants-update', (updatedParticipants) => {
            console.log('Participants updated:', updatedParticipants);
            setParticipants(updatedParticipants);
        });

        socket.on('music-state-update', ({ track, isPlaying: newIsPlaying, position }) => {
            console.log('Received music state update:', { track, isPlaying: newIsPlaying, position });

            if (track) {
                if (!currentTrack || track.id !== currentTrack.id) {
                    if (isPlayerReady.current) {
                        console.log('Loading new track:', track);
                        loadAndPlayVideo(track, position);
                    } else {
                        console.log('Player not ready, setting pending track');
                        pendingTrackRef.current = { track, position };
                    }
                } else if (position) {
                    console.log('Seeking to position:', position);
                    playerRef.current?.seekTo(position, true);
                }
            }

            if (newIsPlaying !== isPlaying) {
                console.log('Updating play state:', newIsPlaying);
                setIsPlaying(newIsPlaying);
                if (playerRef.current && isPlayerReady.current) {
                    if (newIsPlaying) {
                        playerRef.current.playVideo();
                    } else {
                        playerRef.current.pauseVideo();
                    }
                }
            }
        });

        socket.on('music-seek', ({ position }) => {
            console.log('Received seek event:', position);
            if (playerRef.current && isPlayerReady.current) {
                playerRef.current.seekTo(position, true);
            }
        });

        socket.on('search-update', ({ query, results }) => {
            console.log('Received search update:', { query, results });
            setSearchQuery(query);
            setSearchResults(results);
        });

        return () => {
            console.log('Cleaning up socket listeners');
            socket.off('participants-update');
            socket.off('music-state-update');
            socket.off('music-seek');
            socket.off('search-update');
            socket.emit('leave-music-room', roomId);
        };
    }, [socket, roomId]);

    const onPlayerReady = (event) => {
        console.log('Player ready');
        isPlayerReady.current = true;
        event.target.setVolume(volume);

        // Handle any pending track
        if (pendingTrackRef.current) {
            console.log('Loading pending track:', pendingTrackRef.current);
            loadAndPlayVideo(pendingTrackRef.current.track, pendingTrackRef.current.position);
            pendingTrackRef.current = null;
        }
    };

    const onPlayerStateChange = (event) => {
        console.log('Player state changed:', event.data);
        try {
            if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                if (isPlayerReady.current) {
                    setDuration(playerRef.current.getDuration());

                    // Only emit state update if we have a roomId
                    if (currentTrack && roomId) {
                        socket.emit('music-state-update', {
                            roomId,
                            track: currentTrack,
                            isPlaying: true,
                            position: playerRef.current.getCurrentTime() || 0
                        });
                    }
                }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);

                // Only emit state update if we have a roomId
                if (currentTrack && roomId && isPlayerReady.current) {
                    socket.emit('music-state-update', {
                        roomId,
                        track: currentTrack,
                        isPlaying: false,
                        position: playerRef.current.getCurrentTime() || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error in onPlayerStateChange:', error);
            setError('Playback error occurred. Please try refreshing the page.');
        }
    };

    const onPlayerError = (event) => {
        setError('Error playing video. Please try another track.');
        console.error('YouTube player error:', event.data);
    };

    const isPlayerFunctional = () => {
        return playerRef.current &&
            isPlayerReady.current &&
            typeof playerRef.current.getCurrentTime === 'function' &&
            typeof playerRef.current.getDuration === 'function' &&
            typeof playerRef.current.seekTo === 'function';
    };

    // Update the progress interval effect
    useEffect(() => {
        if (isPlaying && isPlayerFunctional()) {
            progressInterval.current = setInterval(() => {
                try {
                    const currentTime = playerRef.current.getCurrentTime() || 0;
                    const duration = playerRef.current.getDuration() || 0;
                    if (duration) {
                        setProgress((currentTime / duration) * 100);
                    }
                } catch (error) {
                    console.error('Error updating progress:', error);
                    clearInterval(progressInterval.current);
                }
            }, 1000);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPlaying]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const loadAndPlayVideo = (track, startPosition = 0) => {
        console.log('Loading video:', track, 'at position:', startPosition);
        if (!isPlayerReady.current) {
            console.log('Player not ready yet, setting pending track');
            pendingTrackRef.current = { track, position: startPosition };
            setCurrentTrack(track);
            return;
        }

        try {
            if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                console.log('Loading video with ID:', track.id);
                playerRef.current.loadVideoById({
                    videoId: track.id,
                    startSeconds: startPosition
                });
                setCurrentTrack(track);
                setIsPlaying(true);
                setError(null);
            } else {
                throw new Error('Player not properly initialized');
            }
        } catch (error) {
            console.error('Error in loadAndPlayVideo:', error);
            setError('Failed to load video. Please try refreshing the page.');
        }
    };

    const handleSearchQueryChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const performSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setIsLoading(true);
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                    searchQuery + ' music'
                )}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`
            );

            const results = response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelTitle: item.snippet.channelTitle
            }));

            setSearchResults(results);
            if (roomId) {
                socket.emit('search-update', { roomId, query: searchQuery, results });
            }
            setError(null);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search for tracks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch();
    };

    const handlePlay = (track) => {
        console.log('Handle play:', track);
        if (!roomId) {
            console.error('No roomId available');
            return;
        }
        loadAndPlayVideo(track);
        socket.emit('music-state-update', {
            roomId,
            track,
            isPlaying: true,
            position: 0
        });
    };

    const handlePlayPause = () => {
        if (!isPlayerFunctional() || !currentTrack || !roomId) return;

        console.log('Handle play/pause, current state:', isPlaying);
        const newIsPlaying = !isPlaying;

        try {
            if (newIsPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }

            socket.emit('music-state-update', {
                roomId,
                track: currentTrack,
                isPlaying: newIsPlaying,
                position: playerRef.current.getCurrentTime() || 0
            });
        } catch (error) {
            console.error('Error in handlePlayPause:', error);
            setError('Failed to control playback. Please try refreshing the page.');
        }
    };

    const handleSeek = (e) => {
        if (!isPlayerFunctional() || !currentTrack || !roomId) return;

        try {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const position = percentage * playerRef.current.getDuration();

            playerRef.current.seekTo(position, true);
            socket.emit('music-seek', { roomId, position });
        } catch (error) {
            console.error('Error in handleSeek:', error);
            setError('Failed to seek. Please try refreshing the page.');
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.setVolume(volume);
            } else {
                playerRef.current.setVolume(0);
            }
            setIsMuted(!isMuted);
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Player Section */}
                            <div className="w-full md:w-2/3 space-y-6">
                                <div id="youtube-player" className="rounded-lg overflow-hidden shadow-2xl"></div>

                                {/* Controls */}
                                <div className="bg-black/40 p-6 rounded-xl backdrop-blur-lg">
                                    {currentTrack && (
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                                            <p className="text-gray-400">{currentTrack.channelTitle}</p>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    <div
                                        className="h-2 bg-gray-700 rounded-full mb-4 cursor-pointer"
                                        onClick={handleSeek}
                                    >
                                        <div
                                            className="h-full bg-purple-500 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={handlePlayPause}
                                                className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition"
                                                disabled={!currentTrack}
                                            >
                                                {isPlaying ? <FaPause /> : <FaPlay />}
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <button onClick={toggleMute}>
                                                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-24"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-400">
                                            {formatTime(progress * duration / 100)} / {formatTime(duration)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Section */}
                            <div className="w-full md:w-1/3 space-y-4">
                                <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchQueryChange}
                                            placeholder="Search for songs..."
                                            className="w-full bg-black/30 text-white pl-12 pr-4 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors flex items-center justify-center"
                                        disabled={!searchQuery.trim()}
                                    >
                                        <FaSearch className="w-5 h-5" />
                                    </button>
                                </form>

                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    <AnimatePresence>
                                        {searchResults && searchResults.map((track) => (
                                            <motion.div
                                                key={track.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-black/30 hover:bg-purple-900/30 cursor-pointer transition"
                                                onClick={() => handlePlay(track)}
                                            >
                                                <img
                                                    src={track.thumbnail}
                                                    alt={track.title}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                                <div>
                                                    <h4 className="font-medium line-clamp-2">{track.title}</h4>
                                                    <p className="text-sm text-gray-400">{track.channelTitle}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Participants */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Room Participants ({participants?.length || 0})</h3>
                        <div className="flex flex-wrap gap-2">
                            {participants && participants.map((id) => (
                                <div
                                    key={id}
                                    className="px-3 py-1 bg-purple-500/20 rounded-full text-sm"
                                >
                                    User {id.slice(0, 6)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default MusicRoom;