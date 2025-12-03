import { render, screen } from '@testing-library/react';
import SunoProjectCard from './SunoProjectCard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authStore';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, vi } from 'vitest';

// Mock store
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Mock SunoSong type if needed, or just pass object
const mockProps: any = {
  _id: '1',
  name: 'Test Song',
  image_url: 'test.jpg',
  audio_url: 'test.mp3',
  tags: 'pop, rock',
  prompt: 'A test song',
  status: 'complete',
  duration: 120,
  created_at: new Date().toISOString(),
  model_name: 'v3',
  gpt_description_prompt: 'Test description',
  metadata: {},
  user_id: 'user1',
  display_name: 'Test User',
  avatar_url: 'avatar.jpg',
  handle: 'testuser',
  upvote_count: 10,
  play_count: 100,
};

describe('SunoProjectCard', () => {
  it('renders correctly', async () => {
    render(
      <Provider store={store}>
        <SnackbarProvider>
          <SunoProjectCard {...mockProps} />
        </SnackbarProvider>
      </Provider>
    );

    // Use findByText because of the typing effect
    expect(await screen.findByText('Test Song')).toBeInTheDocument();
  });
});
