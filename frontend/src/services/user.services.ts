/* Ce fichier gère les requêtes vers le backend pour les opérations utilisateur */
import Axios from '../utils/Axios';

export const createUser = async (userData: { username: string; email: string; password: string; avatar: string; token?: string; }) => {
    try {
        const response = await Axios.post('/users', userData);
        return response.data;
    } catch (error: any) {
        console.error('Error in createUser:', error.response?.data || error.message);
        return null;
    }
};

export const loginUser = async (loginData: { email: string; password: string; }) => {
    try {
        const response = await Axios.post('/users/login', loginData);
        return response.data;
    } catch (error: any) {
        console.error('Error in loginUser:', error.response?.data || error.message);
        return null;
    }
};

export const googleLogin = async (token: string) => {
    try {
        const response = await Axios.post('/users/google-login', { token });
        return response.data;
    } catch (error: any) {
        console.error('Error in googleLogin:', error.response?.data || error.message);
        return null;
    }
};

export const refreshAccessToken = async () => {
    try {
        const response = await Axios.post('/users/refresh-token', {}, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error('Error in refreshAccessToken:', error.response?.data || error.message);
        throw error;
    }
}; 