interface AuthModalProps {
    open: boolean;
    onClose: () => void;
}

interface AuthState {
    token: string | null;
    username: string | null;
    avatar: string | null;
    isAuthenticated: boolean;
} 
