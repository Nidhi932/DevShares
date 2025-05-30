import React, { createContext, useContext, useState, useEffect } from 'react';

const SpotifyContext = createContext();

export const SpotifyProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [playbackState, setPlaybackState] = useState(null);
    const [isPremium, setIsPremium] = useState(false);

    // Function to get access token using Client Credentials flow
    const getAccessToken = async () => {
        const clientId = 'afd0c6cf7bb743ea8fdb6fdea1c77316';
        const clientSecret = '2c57ed5a289440bc89067f6f11fcdade';

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            if (data.access_token) {
                setAccessToken(data.access_token);
                localStorage.setItem('spotify_access_token', data.access_token);
                return data.access_token;
            }
        } catch (error) {
            console.error('Error getting access token:', error);
        }
    };

    // Check if user has Spotify Premium
    const checkPremiumStatus = async (token) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsPremium(data.product === 'premium');
                return data.product === 'premium';
            }
            return false;
        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    };

    // Initialize access token
    useEffect(() => {
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            checkPremiumStatus(storedToken);
        } else {
            getAccessToken();
        }
    }, []);

    useEffect(() => {
        if (!accessToken || !isPremium) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Dev Music Room',
                getOAuthToken: cb => { cb(accessToken); },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                setPlayer(player);
            });

            player.addListener('player_state_changed', state => {
                setPlaybackState(state);
            });

            player.addListener('authentication_error', async () => {
                console.log('Authentication error, getting new token...');
                const newToken = await getAccessToken();
                if (newToken) {
                    player.disconnect();
                    player.connect();
                }
            });

            player.connect();
        };

        return () => {
            script.remove();
            if (player) {
                player.disconnect();
            }
        };
    }, [accessToken, isPremium]);

    const login = async () => {
        const clientId = 'afd0c6cf7bb743ea8fdb6fdea1c77316';
        const redirectUri = 'http://localhost:5173/callback';
        const scope = [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-library-read',
            'user-library-modify',
            'user-read-playback-state',
            'user-modify-playback-state',
            'app-remote-control'
        ].join(' ');

        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('scope', scope);
        authUrl.searchParams.append('show_dialog', 'true');

        window.location.href = authUrl.toString();
    };

    const refreshToken = async () => {
        const newToken = await getAccessToken();
        if (newToken) {
            const hasPremium = await checkPremiumStatus(newToken);
            if (hasPremium && player) {
                player.disconnect();
                player.connect();
            }
        }
    };

    const value = {
        accessToken,
        setAccessToken,
        player,
        deviceId,
        playbackState,
        isPremium,
        login,
        refreshToken
    };

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotify = () => {
    const context = useContext(SpotifyContext);
    if (!context) {
        throw new Error('useSpotify must be used within a SpotifyProvider');
    }
    return context;
};