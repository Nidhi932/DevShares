import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '../context/SpotifyContext';

const SpotifyCallback = () => {
    const navigate = useNavigate();
    const { setAccessToken } = useSpotify();

    useEffect(() => {
        const hash = window.location.hash
            .substring(1)
            .split('&')
            .reduce((initial, item) => {
                const parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
                return initial;
            }, {});

        if (hash.access_token) {
            setAccessToken(hash.access_token);
            // Clear the URL hash
            window.location.hash = '';
            // Navigate to music room or another appropriate page
            navigate('/music-room');
        }
    }, [setAccessToken, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Authenticating with Spotify...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            </div>
        </div>
    );
};

export default SpotifyCallback;
