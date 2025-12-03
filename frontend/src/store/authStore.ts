import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './hooks';
import { AuthState, User } from '../types/auth.types';

// Fonction utilitaire pour sécuriser les opérations localStorage
const safelyStoreItem = (key: string, value: string | null) => {
    try {
        if (value === null || value === undefined) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch (error) {
        console.error(`Error accessing localStorage for key ${key}:`, error);
    }
};

// Fonction utilitaire pour récupérer les données du localStorage
const safelyGetItem = (key: string): string | null => {
    try {
        const item = localStorage.getItem(key);
        return item;
    } catch (error) {
        console.error(`Error accessing localStorage for key ${key}:`, error);
        return null;
    }
};

// Fonction pour restaurer l'état depuis le localStorage
const restoreUserFromStorage = (): User | null => {
    const token = safelyGetItem('accessToken');
    const username = safelyGetItem('username');
    const userId = safelyGetItem('userId');
    const avatar = safelyGetItem('userAvatar');
    const sunoUsername = safelyGetItem('sunoUsername');
    const isActivated = safelyGetItem('isActivated') === 'true';

    if (token && username && userId) {
        return {
            _id: userId,
            username,
            email: '', // Will be updated when needed
            avatar: avatar || '',
            claimed: isActivated,
            likesRemainingToday: 10, // Default value, will be updated from backend
            sunoUsername: sunoUsername || ''
        };
    }
    return null;
};

const initialState: AuthState = {
    user: restoreUserFromStorage(),
    token: safelyGetItem('accessToken'),
    isAuthenticated: !!safelyGetItem('accessToken'),
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; username: string; sunoUsername: string; avatar?: string; _id: string; isActivated?: boolean }>) => {
            const { token, username, sunoUsername, avatar, _id, isActivated } = action.payload;
            state.token = token;
            state.user = {
                _id,
                username,
                email: '', // Will be updated when needed
                avatar: avatar || '',
                claimed: isActivated || false,
                likesRemainingToday: 10,
                sunoUsername: sunoUsername
            };
            state.isAuthenticated = true;

            safelyStoreItem('accessToken', token);
            safelyStoreItem('username', username);
            safelyStoreItem('sunoUsername', sunoUsername);
            safelyStoreItem('userAvatar', avatar || null);
            safelyStoreItem('userId', _id);
            safelyStoreItem('isActivated', isActivated ? 'true' : 'false');
        },
        updateUserProfile: (state, action: PayloadAction<{ sunoUsername?: string; avatar?: string; isActivated?: boolean }>) => {
            if (state.user) {
                const { sunoUsername, avatar, isActivated } = action.payload;
                if (sunoUsername !== undefined) {
                    state.user.sunoUsername = sunoUsername;
                    safelyStoreItem('sunoUsername', sunoUsername);
                }
                if (avatar !== undefined) {
                    state.user.avatar = avatar;
                    safelyStoreItem('userAvatar', avatar);
                }
                if (isActivated !== undefined) {
                    state.user.claimed = isActivated;
                    safelyStoreItem('isActivated', isActivated ? 'true' : 'false');
                }
            }
        },
        setAccountActivated: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.claimed = action.payload;
                safelyStoreItem('isActivated', action.payload ? 'true' : 'false');
            }
        },
        decrementLikesRemaining: (state) => {
            if (state.user) {
                state.user.likesRemainingToday = Math.max(0, state.user.likesRemainingToday - 1);
            }
        },
        incrementLikesRemaining: (state) => {
            if (state.user) {
                state.user.likesRemainingToday = state.user.likesRemainingToday + 1;
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            safelyStoreItem('accessToken', null);
            safelyStoreItem('username', null);
            safelyStoreItem('userAvatar', null);
            safelyStoreItem('userId', null);
            safelyStoreItem('isActivated', 'false');
            safelyStoreItem('sunoUsername', null);
        },
        validateAndRefreshUserData: (state) => {
            if (state.isAuthenticated && !state.user?._id) {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;

                safelyStoreItem('accessToken', null);
                safelyStoreItem('username', null);
                safelyStoreItem('userAvatar', null);
                safelyStoreItem('userId', null);
                safelyStoreItem('isActivated', 'false');
                safelyStoreItem('sunoUsername', null);
            }
        }
    }
});

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer
    }
});

export type AppDispatch = typeof store.dispatch;

export const { setCredentials, updateUserProfile, setAccountActivated, decrementLikesRemaining, incrementLikesRemaining, logout, validateAndRefreshUserData } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state: RootState) => state.auth.user?.username;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUserId = (state: RootState) => state.auth.user?._id;
export const selectCurrentAvatar = (state: RootState) => state.auth.user?.avatar;
export const selectCurrentSunoUsername = (state: RootState) => state.auth.user?.sunoUsername;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsActivated = (state: RootState) => state.auth.user?.claimed;

export default authSlice.reducer; 