import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton, TextField, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styles from '../../styles/ActivateAccountDialog.module.css';
import Axios from '../../utils/Axios';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAccountActivated, selectCurrentUserId, setCredentials } from '../../store/authStore';

interface ActivateAccountDialogProps {
    open: boolean;
    onClose: () => void;
    pulsifyId?: string;
}

// Validation du format du lien Suno
const SUNO_LINK_REGEX = /suno\.(ai|com)\/song\/([a-f0-9-]+)/i;

const verifyAccount = async (sunoLink: string, userId: string) => {
    console.log(sunoLink);
    const response = await Axios.post(`/users/claim/${userId}`, { sunoLink });
    return response.data;
};

const ActivateAccountDialog: React.FC<ActivateAccountDialogProps> = ({ open, onClose, pulsifyId = "" }) => {
    const [copied, setCopied] = useState(false);
    const [sunoLink, setSunoLink] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [linkError, setLinkError] = useState('');
    const { enqueueSnackbar: snackBar } = useSnackbar();
    const dispatch = useAppDispatch();
    const userId = useAppSelector(selectCurrentUserId);
    const user = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);

    // Réinitialiser l'état quand la boîte de dialogue s'ouvre/se ferme
    useEffect(() => {
        if (!open) {
            setSunoLink('');
            setSubmitted(false);
            setLinkError('');
        }
    }, [open]);

    const validateSunoLink = (link: string): boolean => {
        return !!link.match(SUNO_LINK_REGEX);
    };

    const handleCopyId = () => {
        if (!pulsifyId) return;

        navigator.clipboard.writeText(pulsifyId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSunoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const link = e.target.value;
        setSunoLink(link);

        // Nettoyer l'erreur lorsque l'utilisateur modifie le champ
        if (linkError) setLinkError('');
    };

    const handleSubmitLink = async () => {
        if (!sunoLink) {
            setLinkError('Please enter a Suno link');
            return;
        }

        if (!validateSunoLink(sunoLink)) {
            setLinkError('Invalid Suno link format. Example: https://suno.ai/song/123...');
            return;
        }

        // Vérifier que l'userId est disponible
        if (!userId) {
            setLinkError('Session error: user ID not found. Please log in again.');
            snackBar('Session error. Please log in again.', { variant: 'error' });
            setTimeout(() => {
                onClose();
            }, 2000);
            return;
        }

        setLoading(true);
        setLinkError('');

        try {
            // Extraire l'ID de la chanson du lien Suno
            let formattedLink = '';
            if (sunoLink.includes('https://suno.com/song/')) {
                formattedLink = sunoLink.split('https://suno.com/song/')[1];
            } else if (sunoLink.includes('https://suno.ai/song/')) {
                formattedLink = sunoLink.split('https://suno.ai/song/')[1];
            } else {
                // Si le lien ne contient pas les préfixes attendus, essayer d'extraire l'ID directement
                const match = sunoLink.match(SUNO_LINK_REGEX);
                if (match && match[2]) {
                    formattedLink = match[2];
                } else {
                    setLinkError('Could not extract song ID from the provided link');
                    setLoading(false);
                    return;
                }
            }

            // Nettoyer d'éventuels caractères supplémentaires (comme des paramètres d'URL)
            formattedLink = formattedLink.split('?')[0];

            const response = await verifyAccount(formattedLink, userId);

            // Mettre à jour le store avec l'état d'activation et les nouvelles infos utilisateur
            if (response.user && user && token) {
                dispatch(setCredentials({
                    token: token,
                    username: response.user.username,
                    sunoUsername: response.user.sunoUsername,
                    avatar: response.user.avatar,
                    _id: userId,
                    isActivated: true
                }));
            } else {
                dispatch(setAccountActivated(true));
            }

            setSubmitted(true);
            snackBar('Account activation request submitted successfully!', {
                variant: 'success',
                autoHideDuration: 5000
            });

            // Fermer la modal après un court délai
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (error: any) {
            console.error('Error activating account:', error);
            setLinkError(error.response?.data?.message || 'An error occurred while activating your account. Please try again.');
            snackBar('Error activating account. Please try again.', {
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            PaperProps={{
                className: styles.dialogPaper
            }}
        >
            <DialogTitle className={styles.dialogHeader}>
                <Typography className={styles.headerTitle}>
                    Account Activation
                </Typography>
                <IconButton onClick={onClose} className={styles.closeButton}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent className={styles.dialogContent}>
                {!pulsifyId ? (
                    <Typography className={styles.errorText}>
                        Unable to retrieve your Pulsify ID. Please try again later or contact support.
                    </Typography>
                ) : (
                    <>
                        <Typography className={styles.introText}>
                            To activate your Pulsify account, please follow these steps:
                        </Typography>

                        <Box className={styles.stepsContainer}>
                            <Box className={styles.stepContainer}>
                                <Typography className={styles.stepNumber}>1.</Typography>
                                <Typography className={styles.stepText}>
                                    Create a new track on <a href="https://suno.ai" target="_blank" rel="noopener noreferrer" className={styles.stepLink}>Suno.ai</a>
                                </Typography>
                            </Box>

                            <Box className={styles.stepContainer}>
                                <Typography className={styles.stepNumber}>2.</Typography>
                                <Typography className={styles.stepText}>
                                    In the "Style of music" section of your creation, add the following :
                                </Typography>
                            </Box>

                            <Box className={styles.pulsifyIdBox}>
                                <Typography className={styles.glowingText}>
                                    {pulsifyId}
                                </Typography>
                                <IconButton
                                    onClick={handleCopyId}
                                    className={copied ? styles.copyButtonSuccess : styles.copyButton}
                                >
                                    {copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                                </IconButton>
                            </Box>

                            <Box className={styles.stepContainer}>
                                <Typography className={styles.stepNumber}>3.</Typography>
                                <Typography className={styles.stepText}>
                                    Publish your track (in private) and paste the link in the bottom of this modal to activate your account
                                </Typography>
                            </Box>
                        </Box>

                        <Typography className={styles.infoText}>
                            If you encounter any issues, please don't hesitate to contact us at support@pulsify.com
                        </Typography>

                        <Box className={styles.sunoLinkContainer}>
                            <Typography className={styles.sunoLinkTitle}>
                                Paste your Suno link here :
                            </Typography>
                            <Box className={styles.sunoLinkInputBox}>
                                <TextField
                                    placeholder="https://suno.ai/song/your-song-id"
                                    value={sunoLink}
                                    onChange={handleSunoLinkChange}
                                    variant="outlined"
                                    fullWidth
                                    error={!!linkError}
                                    helperText={linkError}
                                    FormHelperTextProps={{
                                        className: styles.helperText
                                    }}
                                    className={styles.sunoLinkInput}
                                    InputProps={{
                                        style: {
                                            color: 'white',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                        },
                                        startAdornment: linkError ? (
                                            <ErrorOutlineIcon className={styles.errorIcon} />
                                        ) : null
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: linkError ? '#ff4d4d !important' : 'rgba(108, 99, 255, 0.4)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: linkError ? '#ff4d4d !important' : 'rgba(108, 99, 255, 0.7)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: linkError ? '#ff4d4d !important' : '#6c63ff',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            color: 'white',
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={handleSubmitLink}
                                    disabled={!sunoLink || submitted || loading}
                                    className={styles.submitLinkButton}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} className={styles.loadingSpinner} />
                                    ) : submitted ? (
                                        <CheckCircleOutlineIcon className={styles.successIcon} />
                                    ) : (
                                        <SendIcon />
                                    )}
                                </IconButton>
                            </Box>
                            {submitted && (
                                <Typography className={styles.successText}>
                                    Account activation successful ! You can close this dialog.
                                </Typography>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions className={styles.dialogActions}>
                <Button onClick={onClose} className={styles.styledButton}>
                    {submitted ? 'Close' : 'I understand'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActivateAccountDialog;
