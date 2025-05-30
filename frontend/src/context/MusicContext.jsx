import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

const YOUTUBE_API_KEY = 'AIzaSyBUBrsrU9MPDgA8xt803UgFObsrAVFQ2fk'; // Replace with your YouTube API key

export const MusicProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [player, setPlayer] = useState(null);
    const playerRef = useRef(null);

    // Initialize YouTube Player
    useEffect(() => {
        // Load YouTube IFrame Player API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '0',
                width: '0',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                },
                events: {
                    onReady: (event) => {
                        setPlayer(event.target);
                        event.target.setVolume(volume);
                    },
                    onStateChange: (event) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                    }
                }
            });
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Search tracks using YouTube Data API
    const searchTracks = async (query) => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + " song")}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`
            );
            const data = await response.json();
            return data.items.map(item => ({
                id: item.id.videoId,
                name: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default.url,
                channelTitle: item.snippet.channelTitle
            }));
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    };

    // Play a track
    const playTrack = async (track) => {
        try {
            if (player) {
                await player.loadVideoById(track.id);
                player.playVideo();
                setCurrentTrack(track);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Playback error:', error);
        }
    };

    // Pause the current track
    const pauseTrack = () => {
        if (player) {
            player.pauseVideo();
            setIsPlaying(false);
        }
    };

    // Resume the current track
    const resumeTrack = () => {
        if (player) {
            player.playVideo();
            setIsPlaying(true);
        }
    };

    // Seek to position
    const seekToPosition = (seconds) => {
        if (player) {
            player.seekTo(seconds, true);
        }
    };

    // Set volume (0-100)
    const setAudioVolume = (newVolume) => {
        if (player) {
            player.setVolume(newVolume);
            setVolume(newVolume);
        }
    };

    // Get current time
    const getCurrentTime = () => {
        return player ? player.getCurrentTime() : 0;
    };

    // Get duration
    const getDuration = () => {
        return player ? player.getDuration() : 0;
    };

    const value = {
        currentTrack,
        isPlaying,
        volume,
        searchTracks,
        playTrack,
        pauseTrack,
        resumeTrack,
        seekToPosition,
        setAudioVolume,
        getCurrentTime,
        getDuration
    };

    return (
        <MusicContext.Provider value={value}>
            <div id="youtube-player" />
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}; 