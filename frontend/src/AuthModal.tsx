import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { loginUser, createUser } from './services/userServices';
import { useAppDispatch } from './store/hooks';
import { setCredentials } from './store/authStore';
import { useSnackbar } from 'notistack';
import { processAvatar } from './services/imageService';

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();
    const { enqueueSnackbar: snackBar } = useSnackbar();
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    // États pour les champs d'inscription
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

    // Nouveaux états pour l'avatar
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Nouveaux états d'erreur pour la partie Sign Up
    const [errorSignUpUsername, setErrorSignUpUsername] = useState(false);
    const [errorSignUpEmail, setErrorSignUpEmail] = useState(false);
    const [errorSignUpPassword, setErrorSignUpPassword] = useState(false);
    const [errorSignUpConfirmPassword, setErrorSignUpConfirmPassword] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            try {
                const avatarData = await processAvatar(e.target.files[0]);
                setAvatar(e.target.files[0]);
                setAvatarPreview(avatarData);
            } catch (error) {
                snackBar('Erreur lors du traitement de l\'image', { variant: 'error' });
            }
        }
    };

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email: loginEmail, password: loginPassword });
            if (response && response.token && response.user) {
                dispatch(setCredentials({
                    token: response.token,
                    username: response.user.username,
                    avatar: response.user.avatar
                }));
                snackBar('Connexion réussie', { variant: 'success' });
                onClose();
            } else {
                setLoginError('Email ou mot de passe incorrect');
                snackBar('Email ou mot de passe incorrect', { variant: 'error' });
            }
        } catch (error) {
            setLoginError('Email ou mot de passe incorrect');
            snackBar('Erreur lors de la connexion', { variant: 'error' });
        }
    };

    const handleSignUpValidated = async () => {
        let valid = true;

        if (!signUpUsername) {
            setErrorSignUpUsername(true);
            valid = false;
        }
        if (!signUpEmail) {
            setErrorSignUpEmail(true);
            valid = false;
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(signUpEmail)) {
                setErrorSignUpEmail(true);
                valid = false;
            }
        }
        if (!signUpPassword) {
            setErrorSignUpPassword(true);
            valid = false;
        }
        if (!signUpConfirmPassword) {
            setErrorSignUpConfirmPassword(true);
            valid = false;
        }
        if (signUpPassword && signUpConfirmPassword && signUpPassword !== signUpConfirmPassword) {
            setErrorSignUpPassword(true);
            setErrorSignUpConfirmPassword(true);
            valid = false;
        }
        if (!valid) {
            setTimeout(() => {
                setErrorSignUpUsername(false);
                setErrorSignUpEmail(false);
                setErrorSignUpPassword(false);
                setErrorSignUpConfirmPassword(false);
            }, 1000);
            return;
        }

        try {
            let avatarData = 'default-avatar.png';
            if (avatar) {
                avatarData = await processAvatar(avatar);
            }

            const newUser = await createUser({
                username: signUpUsername,
                email: signUpEmail,
                password: signUpPassword,
                avatar: avatarData
            });

            if (newUser && newUser.token && newUser.user) {
                dispatch(setCredentials({
                    token: newUser.token,
                    username: newUser.user.username,
                    avatar: newUser.user.avatar
                }));
                snackBar('Inscription réussie', { variant: 'success' });
                onClose();
            } else {
                snackBar('Erreur lors de l\'inscription', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            snackBar('Erreur lors de l\'inscription', { variant: 'error' });
        }
    };

    // Style pour retirer le gris de l'autofill
    const autofillStyles = {
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px white inset',
            WebkitTextFillColor: '#000000',
        },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        width: '600px',
                        minHeight: '350px'
                    }
                }
            }}
        >
            <DialogTitle sx={{ fontSize: '28px', padding: '12px 24px' }}>{tabIndex === 0 ? 'Login' : 'Sign Up'}</DialogTitle>
            <DialogContent sx={{ padding: '12px 24px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="auth tabs">
                        <Tab
                            sx={{
                                '&:focus': { outline: 'none' },
                                fontSize: '18px',
                                padding: '6px 16px'
                            }}
                            label="Login"
                        />
                        <Tab
                            sx={{
                                '&:focus': { outline: 'none' },
                                fontSize: '18px',
                                padding: '6px 16px'
                            }}
                            label="Sign Up"
                        />
                    </Tabs>
                </Box>
                {tabIndex === 0 && (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                            label="Email"
                            value={loginEmail}
                            onChange={(e) => {
                                setLoginEmail(e.target.value);
                                setLoginError('');
                            }}
                            variant="outlined"
                            fullWidth
                            sx={{
                                ...autofillStyles,
                                '& .MuiInputBase-input': {
                                    fontSize: '18px',
                                    padding: '10px 14px',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '18px'
                                }
                            }}
                            error={!!loginError}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setLoginError('');
                            }}
                            variant="outlined"
                            fullWidth
                            sx={{
                                ...autofillStyles,
                                '& .MuiInputBase-input': {
                                    fontSize: '18px',
                                    padding: '10px 14px',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '18px'
                                },
                                '& .MuiFormHelperText-root': {
                                    fontSize: '16px',
                                    marginTop: '2px'
                                }
                            }}
                            error={!!loginError}
                            helperText={loginError}
                        />
                    </Box>
                )}
                {tabIndex === 1 && (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Username"
                            value={signUpUsername}
                            onChange={(e) => setSignUpUsername(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={autofillStyles}
                            required
                            error={errorSignUpUsername}
                        />
                        <TextField
                            label="Email"
                            value={signUpEmail}
                            onChange={(e) => {
                                setSignUpEmail(e.target.value);
                                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                                setErrorSignUpEmail(!emailRegex.test(e.target.value));
                            }}
                            variant="outlined"
                            fullWidth
                            sx={autofillStyles}
                            required
                            error={errorSignUpEmail}
                            helperText={errorSignUpEmail ? "Adresse email invalide" : ""}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={autofillStyles}
                            required
                            error={errorSignUpPassword}
                        />
                        <TextField
                            label="Confirm Password"
                            type="password"
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={autofillStyles}
                            required
                            error={errorSignUpConfirmPassword}
                            helperText={errorSignUpConfirmPassword ? "Les mots de passe ne correspondent pas" : ""}
                        />
                        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                            Upload Avatar
                            <input type="file" accept="image/" hidden onChange={handleAvatarChange} />
                        </Button>
                        {avatarPreview && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ padding: '12px 24px' }}>
                <Button
                    onClick={onClose}
                    sx={{
                        fontSize: '18px',
                        padding: '6px 20px'
                    }}
                >
                    Cancel
                </Button>
                {tabIndex === 0 ? (
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        sx={{
                            backgroundColor: "#251db9",
                            color: "white",
                            '&:hover': { backgroundColor: "#1f1ba0" },
                            '&:focus': { outline: 'none', boxShadow: 'none', border: 'none' },
                            fontSize: '18px',
                            padding: '6px 20px'
                        }}
                    >
                        Login
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleSignUpValidated}
                        sx={{
                            backgroundColor: "#251db9",
                            color: "white",
                            '&:hover': { backgroundColor: "#1f1ba0" },
                            '&:focus': { outline: 'none', boxShadow: 'none', border: 'none' },
                            fontSize: '18px',
                            padding: '6px 20px'
                        }}
                    >
                        Sign Up
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AuthModal;
