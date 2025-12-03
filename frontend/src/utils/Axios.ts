import axios from 'axios';
import { store } from '../store/authStore';
import { selectCurrentToken, setCredentials, logout } from '../store/authStore';
import { refreshAccessToken } from '../services/user.services';

// Création de l'instance Axios avec l'URL de base et les headers par défaut
// En développement, on utilise le proxy (chemin relatif vide) pour éviter les problèmes CORS
const Axios = axios.create({
    baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:4000'),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// File d'attente pour les requêtes en attente de refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Intercepteur de requêtes : ajoute le token d'accès aux headers s'il est présent
Axios.interceptors.request.use(
    (config) => {
        const token = selectCurrentToken(store.getState());
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur de réponses : en cas de 401, tente de rafraîchir le token et réessaie la requête
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return Axios(originalRequest);
                    })
                    .catch(err => {
                        store.dispatch(logout());
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await refreshAccessToken();
                if (response && response.token) {
                    store.dispatch(setCredentials({
                        token: response.token,
                        username: response.user.username,
                        sunoUsername: response.user.sunoUsername || '',
                        avatar: response.user.avatar,
                        _id: response.user.id
                    }));

                    processQueue(null, response.token);
                    return Axios(originalRequest);
                } else {
                    store.dispatch(logout());
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default Axios; 