interface AuthModalProps {
    open: boolean;
    onClose: () => void;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    claimed: boolean;
    likesRemainingToday: number;
    sunoUsername: string | null;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
} 
