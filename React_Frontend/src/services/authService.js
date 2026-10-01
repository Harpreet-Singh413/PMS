import api from './api';

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('Network error: Could not reach the server. Please check if the backend is running.');
        }
        throw new Error('An unexpected error occurred during registration.');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('Network error: Could not reach the server. Please check if the backend is running.');
        }
        throw new Error('An unexpected error occurred during login.');
    }
};
