import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    username: string | null;
    avatar: string | null;
    _id: string | null;
    isAuthenticated: boolean;
    isActivated: boolean;
}

// Fonction utilitaire pour sécuriser les opérations localStorage
const safelyStoreItem = (key: string, value: string | null) => {
    try {
        if (value === null || value === undefined) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch (error) {
        console.error(`Erreur lors de l'accès au localStorage pour la clé ${key}:`, error);
    }
};

// Fonction utilitaire pour récupérer les données du localStorage
const safelyGetItem = (key: string): string | null => {
    try {
        const item = localStorage.getItem(key);
        return item;
    } catch (error) {
        console.error(`Erreur lors de l'accès au localStorage pour la clé ${key}:`, error);
        return null;
    }
};

const initialState: AuthState = {
    token: safelyGetItem('accessToken'),
    username: safelyGetItem('username'),
    avatar: safelyGetItem('userAvatar'),
    _id: safelyGetItem('userId'),
    isAuthenticated: !!safelyGetItem('accessToken'),
    isActivated: safelyGetItem('isActivated') === 'true'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; username: string; avatar?: string; _id: string; isActivated?: boolean }>) => {
            const { token, username, avatar, _id, isActivated } = action.payload;

            if (!_id) {
                console.error("Attention : tentative de définir un userId undefined ou null");
                return;
            }

            state.token = token;
            state.username = username;
            state.avatar = avatar || null;
            state._id = _id;
            state.isActivated = isActivated || false;
            state.isAuthenticated = true;

            safelyStoreItem('accessToken', token);
            safelyStoreItem('username', username);
            safelyStoreItem('userAvatar', avatar || null);
            safelyStoreItem('userId', _id);
            safelyStoreItem('isActivated', isActivated ? 'true' : 'false');
        },
        setAccountActivated: (state, action: PayloadAction<boolean>) => {
            state.isActivated = action.payload;
            safelyStoreItem('isActivated', action.payload ? 'true' : 'false');
        },
        validateAndRefreshUserData: (state) => {
            // Vérifier si les données sont cohérentes
            if (state.isAuthenticated && !state._id) {
                console.error("État incohérent : authentifié mais sans userId - déconnexion préventive");
                // Déconnexion préventive
                state.token = null;
                state.username = null;
                state.avatar = null;
                state._id = null;
                state.isAuthenticated = false;
                state.isActivated = false;

                safelyStoreItem('accessToken', null);
                safelyStoreItem('username', null);
                safelyStoreItem('userAvatar', null);
                safelyStoreItem('userId', null);
                safelyStoreItem('isActivated', 'false');
            }
        },
        logout: (state) => {
            state.token = null;
            state.username = null;
            state.avatar = null;
            state._id = null;
            state.isAuthenticated = false;
            state.isActivated = false;

            safelyStoreItem('accessToken', null);
            safelyStoreItem('username', null);
            safelyStoreItem('userAvatar', null);
            safelyStoreItem('userId', null);
            safelyStoreItem('isActivated', 'false');
        }
    }
});

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setCredentials, setAccountActivated, logout, validateAndRefreshUserData } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.username;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentAvatar = (state: { auth: AuthState }) => state.auth.avatar;
export const selectCurrentUserId = (state: { auth: AuthState }) => state.auth._id;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsActivated = (state: { auth: AuthState }) => state.auth.isActivated;

export default authSlice.reducer; 