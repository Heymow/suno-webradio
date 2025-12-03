import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import ProfileDetails from './ProfileDetails';
import Axios from '../utils/Axios';
import authReducer from '../store/authStore';

// Mock Axios
vi.mock('../utils/Axios');

// Mock styles
vi.mock('../styles/ProfileDetails.module.css', () => ({
  default: {
    profileDetailsContainer: 'profileDetailsContainer',
    profileDetailsContent: 'profileDetailsContent',
    avatarContainer: 'avatarContainer',
    largeAvatar: 'largeAvatar',
    detailTitle: 'detailTitle',
    detailLabel: 'detailLabel',
    detailValue: 'detailValue',
    errorMessage: 'errorMessage'
  }
}));

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: {
          _id: 'user123',
          username: 'TestUser',
          avatar: 'avatar.jpg',
          ...initialState
        },
        token: 'token',
        isAuthenticated: true,
        loading: false,
        error: null
      }
    }
  });

  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ProfileDetails', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches user details', async () => {
    const mockUserData = {
      username: 'TestUser',
      sunoUsername: 'SunoUser',
      email: 'test@example.com',
      likesRemainingToday: 5
    };

    (Axios.get as any).mockResolvedValue({ data: mockUserData });

    renderWithStore(<ProfileDetails onClose={mockOnClose} />);

    // Check initial render
    expect(screen.getByText('Profile Information')).toBeInTheDocument();

    // Wait for data to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('SunoUser')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    expect(Axios.get).toHaveBeenCalledWith('/users/user123');
  });

  it('displays error message when fetch fails', async () => {
    (Axios.get as any).mockRejectedValue(new Error('Network error'));

    renderWithStore(<ProfileDetails onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching information')).toBeInTheDocument();
    });
  });

  it('displays "Not defined" for missing fields', async () => {
    const mockUserData = {
      username: '',
      sunoUsername: '',
      email: '',
      likesRemainingToday: 10
    };

    (Axios.get as any).mockResolvedValue({ data: mockUserData });

    renderWithStore(<ProfileDetails onClose={mockOnClose} />);

    await waitFor(() => {
      const notDefinedElements = screen.getAllByText('Not defined');
      expect(notDefinedElements.length).toBeGreaterThan(0);
    });
  });
});
