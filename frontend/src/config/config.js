const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

export const SERVER_URL = isDevelopment 
    ? 'http://localhost:8181'
    : 'https://devshares.onrender.com'; 
