import axios from 'axios';
import { store } from '../store/authStore';
import { selectCurrentToken, setCredentials } from '../store/authStore';
import { refreshAccessToken } from '../services/userServices';

// Création de l'instance Axios avec l'URL de base et les headers par défaut
const Axios = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // Pour envoyer les cookies avec les requêtes
});

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
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshResponse = await refreshAccessToken();
            if (refreshResponse && refreshResponse.token) {
                store.dispatch(setCredentials({
                    token: refreshResponse.token,
                    username: refreshResponse.user.username
                }));
                originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
                return Axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

export default Axios; 