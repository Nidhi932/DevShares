// keepAlive.js
import axios from 'axios';

const PING_INTERVAL = 840000; // 14 minutes
const SERVER_URL = 'https://devshares.onrender.com';

export const keepAlive = () => {
    setInterval(async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/health`);
            console.log('Keep-alive ping successful:', response.data);
        } catch (error) {
            console.error('Keep-alive ping failed:', error.message);
        }
    }, PING_INTERVAL);
};
