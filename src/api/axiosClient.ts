import axios from 'axios';

// If VITE_API_BASE_URL is not set or empty, baseURL is an empty string (relative paths like /api/...)
// If VITE_API_BASE_URL is set (e.g. https://sts-backend-xyz.a.run.app), baseURL prefixes all requests
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
