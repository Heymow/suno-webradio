import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { loginUser, createUser } from '../../services/user.services';
import { useAppDispatch } from '../../store/hooks';
import { useSnackbar } from 'notistack';
import { setCredentials } from '../../store/authStore';
import { processAvatar } from '../../services/image.service';
import styles from '../../styles/authModal.module.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
    const dispatch = useAppDispatch();
    const { enqueueSnackbar: snackBar } = useSnackbar();
    const [tabIndex, setTabIndex] = useState(0);
    const [formVisible, setFormVisible] = useState(false);

    // Effet pour l'animation d'entrée du formulaire
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setFormVisible(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setFormVisible(false);
        }
    }, [open, tabIndex]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setFormVisible(false);
        setTimeout(() => {
            setTabIndex(newValue);
            setFormVisible(true);
        }, 300);
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
                    avatar: response.user.avatar,
                    sunoUsername: response.user.sunoUsername,
                    _id: response.user._id,
                    isActivated: response.user.isActivated || false
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
                    sunoUsername: newUser.user.sunoUsername,
                    avatar: newUser.user.avatar,
                    _id: newUser.user._id
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

    const handleClose = () => {
        setFormVisible(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const iconStyle = {
        fontSize: '22px',
        marginRight: '8px'
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            className={styles.modal}
            slotProps={{
                paper: {
                    className: styles.modalContent
                }
            }}
        >
            <div className={styles.tabs}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="auth tabs"
                    sx={{
                        width: '100%',
                        '& .MuiTabs-indicator': { display: 'none' }
                    }}
                >
                    <Tab
                        className={`${styles.tab} ${tabIndex === 0 ? styles.active : ''} ${styles.loginTab}`}
                        label={<span style={{ color: tabIndex === 0 ? '#fff' : '#6e64ff' }}>Se connecter</span>}
                        icon={<LoginIcon sx={{ fontSize: '24px', color: tabIndex === 0 ? '#fff' : '#6e64ff' }} />}
                        iconPosition="start"
                    />
                    <Tab
                        className={`${styles.tab} ${tabIndex === 1 ? styles.active : ''} ${styles.signUpTab}`}
                        label={<span style={{ color: tabIndex === 1 ? '#fff' : '#8B80FF' }}>S'inscrire</span>}
                        icon={<PersonAddIcon sx={{ fontSize: '24px', color: tabIndex === 1 ? '#fff' : '#8B80FF' }} />}
                        iconPosition="start"
                    />
                </Tabs>
            </div>
            <div className={styles.modalBody}>
                {tabIndex === 0 && (
                    <Box
                        component="form"
                        className={`${styles.formGroup} ${formVisible ? styles.formVisible : ''}`}
                        sx={{ opacity: formVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
                    >
                        <TextField
                            label="Email"
                            value={loginEmail}
                            onChange={(e) => {
                                setLoginEmail(e.target.value);
                                setLoginError('');
                            }}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            error={!!loginError}
                        />
                        <TextField
                            label="Mot de passe"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setLoginError('');
                            }}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            error={!!loginError}
                            helperText={loginError}
                        />
                    </Box>
                )}
                {tabIndex === 1 && (
                    <Box
                        component="form"
                        className={`${styles.formGroup} ${formVisible ? styles.formVisible : ''}`}
                        sx={{ opacity: formVisible ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
                    >
                        <TextField
                            label="Nom d'utilisateur"
                            value={signUpUsername}
                            onChange={(e) => setSignUpUsername(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            required
                            error={errorSignUpUsername}
                        />
                        <TextField
                            label="Email"
                            value={signUpEmail}
                            onChange={(e) => {
                                setSignUpEmail(e.target.value);
                                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                                setErrorSignUpEmail(!emailRegex.test(e.target.value) && e.target.value !== '');
                            }}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            required
                            error={errorSignUpEmail}
                            helperText={errorSignUpEmail ? "Adresse email invalide" : ""}
                        />
                        <TextField
                            label="Mot de passe"
                            type="password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            required
                            error={errorSignUpPassword}
                        />
                        <TextField
                            label="Confirmer le mot de passe"
                            type="password"
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            className={styles.input}
                            required
                            error={errorSignUpConfirmPassword}
                            helperText={errorSignUpConfirmPassword ? "Les mots de passe ne correspondent pas" : ""}
                        />
                        <div className={styles.avatarUpload}>
                            <Button
                                variant="outlined"
                                component="label"
                                className={`${styles.button} ${styles.secondary}`}
                                startIcon={<CloudUploadIcon sx={{ fontSize: '24px' }} />}
                                size="large"
                            >
                                Choisir un avatar
                                <input type="file" accept="image/" hidden onChange={handleAvatarChange} />
                            </Button>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar Preview" className={styles.avatarPreview} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <PersonAddIcon sx={{ fontSize: 70, color: 'rgba(255,255,255,0.2)' }} />
                                </div>
                            )}
                        </div>
                    </Box>
                )}
            </div>
            <div className={styles.modalFooter}>
                <Button
                    onClick={handleClose}
                    className={`${styles.button} ${styles.secondary}`}
                    size="large"
                >
                    Annuler
                </Button>
                {tabIndex === 0 ? (
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        className={`${styles.button} ${styles.primary}`}
                        startIcon={<LoginIcon sx={{ fontSize: '24px' }} />}
                        size="large"
                    >
                        Se connecter
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleSignUpValidated}
                        className={`${styles.button} ${styles.primary}`}
                        startIcon={<PersonAddIcon sx={{ fontSize: '24px' }} />}
                        size="large"
                    >
                        S'inscrire
                    </Button>
                )}
            </div>
        </Dialog>
    );
};

export default AuthModal;
