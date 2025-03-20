import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
    token: localStorage.getItem('accessToken'),
    username: localStorage.getItem('username'),
    avatar: localStorage.getItem('userAvatar'),
    isAuthenticated: !!localStorage.getItem('accessToken')
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; username: string; avatar?: string }>) => {
            const { token, username, avatar } = action.payload;
            state.token = token;
            state.username = username;
            state.avatar = avatar || null;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', token);
            localStorage.setItem('username', username);
            if (avatar) localStorage.setItem('userAvatar', avatar);
        },
        logout: (state) => {
            state.token = null;
            state.username = null;
            state.avatar = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userAvatar');
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

export const { setCredentials, logout } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.username;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentAvatar = (state: { auth: AuthState }) => state.auth.avatar;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer; 