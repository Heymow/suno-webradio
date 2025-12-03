import { render, screen } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authStore';
import { describe, it, expect, vi } from 'vitest';

// Mock store
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Mock react-modern-audio-player
vi.mock('react-modern-audio-player', () => ({
  default: () => <div data-testid="mock-audio-player">Audio Player</div>,
}));

describe('AudioPlayer', () => {
  it('renders correctly', () => {
    render(
      <Provider store={store}>
        <AudioPlayer />
      </Provider>
    );

    expect(screen.getByText('Aucune piste à lire')).toBeInTheDocument();
  });
});
