import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyMusicSent from './MyMusicSent';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authStore';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from '../utils/Axios';

// Mock Axios
vi.mock('../utils/Axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn()
    }
}));

// Mock LightSunoCard to avoid complex rendering
vi.mock('./LightSunoCard', () => ({
    default: (props: any) => <div data-testid="suno-card">{props.name}</div>
}));

// Mock store
const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            auth: authReducer,
        },
        preloadedState: {
            auth: {
                user: { _id: 'user1', username: 'testuser' },
                isAuthenticated: true,
                ...initialState
            }
        }
    });
};

describe('MyMusicSent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and fetches songs', async () => {
        const mockSongs = [
            { _id: '1', name: 'Song 1', status: 'complete' },
            { _id: '2', name: 'Song 2', status: 'complete' }
        ];
        (Axios.get as any).mockResolvedValue({ data: mockSongs });

        render(
            <Provider store={createMockStore()}>
                <SnackbarProvider>
                    <MyMusicSent />
                </SnackbarProvider>
            </Provider>
        );

        // Check if title exists
        expect(screen.getByText('My Music')).toBeInTheDocument();

        // Wait for songs to load
        await waitFor(() => {
            expect(screen.getByText('Song 1')).toBeInTheDocument();
            expect(screen.getByText('Song 2')).toBeInTheDocument();
        });
    });

    it('validates invalid suno link', async () => {
        render(
            <Provider store={createMockStore()}>
                <SnackbarProvider>
                    <MyMusicSent />
                </SnackbarProvider>
            </Provider>
        );

        // Click the + button to show input
        const plusButton = screen.getByText('+');
        fireEvent.click(plusButton);

        const input = await screen.findByPlaceholderText(/Paste your Suno song link here/i);
        fireEvent.change(input, { target: { value: 'invalid-link' } });

        const submitBtn = screen.getByText('+');
        fireEvent.click(submitBtn);

        const errorMessages = await screen.findAllByText(/Invalid Suno link format/i);
        expect(errorMessages.length).toBeGreaterThan(0);
    });
});
