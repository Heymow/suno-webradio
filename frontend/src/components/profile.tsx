import React, { useState, useEffect } from 'react';
import { Drawer, Avatar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Button, Box, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUser, selectCurrentAvatar, selectCurrentUserId, selectIsAuthenticated, selectIsActivated, logout, validateAndRefreshUserData } from '../store/authStore';
import ActivateAccountDialog from './dialog/activateAccount';
import styles from '../styles/Profile.module.css';
import Axios from '../utils/Axios';
import ProfileDetails from './ProfileDetails';
import MyMusicSent from './MyMusicSent';

interface ProfileProps {
    open: boolean;
    onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ open, onClose }) => {
    const [activateDialogOpen, setActivateDialogOpen] = useState(false);
    const [showProfileDetails, setShowProfileDetails] = useState(false);
    const [showMusicSent, setShowMusicSent] = useState(false);
    const [showAnalyse, setShowAnalyse] = useState(false);
    const [pulsifyId, setPulsifyId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const username = useAppSelector(selectCurrentUser);
    const userAvatar = useAppSelector(selectCurrentAvatar);
    const userId = useAppSelector(selectCurrentUserId);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isActivated = useAppSelector(selectIsActivated);

    const dispatch = useAppDispatch();

    // Vérifier que les données sont cohérentes à chaque ouverture
    useEffect(() => {
        if (open) {
            dispatch(validateAndRefreshUserData());

            if (isAuthenticated && !userId) {
                setError("Problème avec votre session. Veuillez vous reconnecter.");
                onClose();
                return;
            }

            setError(null);
        }
    }, [open, isAuthenticated, userId, dispatch, onClose]);

    const fetchPulsifyId = async () => {
        if (!userId) {
            setError("Impossible de récupérer votre ID utilisateur. Veuillez vous reconnecter.");
            return;
        }

        try {
            const response = await Axios.get(`/users/pulsify-id/${userId}`);
            setPulsifyId(response.data.pulsifyId);
        } catch (error) {
            console.error("Error fetching pulsifyId:", error);
            setPulsifyId("");
            setError("Impossible de récupérer votre Pulsify ID.");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        onClose();
    };

    const handleActivate = () => {
        setError(null);
        fetchPulsifyId();
        setActivateDialogOpen(true);
    };

    const handleCloseActivateDialog = () => {
        setActivateDialogOpen(false);
    };

    const handleProfileClick = () => {
        setShowProfileDetails(true);
    };

    const handleCloseProfileDetails = () => {
        setShowProfileDetails(false);
    };

    const handleMusicSentClick = () => {
        setShowMusicSent(true);
    };

    const handleCloseMusicSent = () => {
        setShowMusicSent(false);
    };

    const handleAnalyseClick = () => {
        setShowAnalyse(true);
    };

    const handleCloseAnalyse = () => {
        setShowAnalyse(false);
    };

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        width: '400px',
                        backgroundColor: '#080821',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
                transitionDuration={300}
            >
                <Box className={styles.contentWrapper}>
                    {error ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="error">{error}</Typography>
                            <Button
                                onClick={onClose}
                                sx={{ mt: 2 }}
                                variant="contained"
                                color="primary"
                            >
                                Fermer
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <div>
                                <div className={styles.profileInfo}>
                                    <IconButton onClick={onClose} className={styles.backBtn}>
                                        <ArrowForwardIcon />
                                    </IconButton>

                                    <Avatar
                                        src={userAvatar || undefined}
                                        alt={username || 'User'}
                                        className={styles.avatar}
                                    />
                                    <Typography variant="h5" className={styles.profileName}>
                                        {username || 'Guest'}
                                    </Typography>
                                </div>

                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {isActivated ? (
                                        <Tooltip title="Your account is verified and can submit music">
                                            <Button
                                                startIcon={<CheckCircleIcon className={styles.checkIcon} />}
                                                className={`${styles.activateButton} ${styles.activatedButton}`}
                                                disableRipple
                                            >
                                                Account Verified
                                            </Button>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            startIcon={<VerifiedUserIcon />}
                                            onClick={handleActivate}
                                            className={styles.activateButton}
                                        >
                                            Activate Account
                                        </Button>
                                    )}
                                </Box>

                                <Divider className={styles.divider} />

                                <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ListItemButton className={styles.listItemButton} onClick={handleProfileClick}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <PersonIcon className={styles.iconColor} />
                                        </ListItemIcon>
                                        <ListItemText primary="Profile" />
                                    </ListItemButton>
                                    <ListItemButton className={styles.listItemButton} onClick={handleMusicSentClick}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <HistoryIcon className={styles.iconColor} />
                                        </ListItemIcon>
                                        <ListItemText primary="Submitted songs" />
                                    </ListItemButton>
                                    <ListItemButton className={styles.listItemButton} onClick={handleAnalyseClick}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <AnalyticsIcon className={styles.iconColor} />
                                        </ListItemIcon>
                                        <ListItemText primary="Watched songs " />
                                    </ListItemButton>
                                    <ListItemButton className={styles.listItemButton}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <SettingsIcon className={styles.iconColor} />
                                        </ListItemIcon>
                                        <ListItemText primary="Settings" />
                                    </ListItemButton>
                                    <ListItemButton className={styles.listItemButton}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <SettingsIcon className={styles.iconColor} />
                                        </ListItemIcon>
                                        <ListItemText primary="About" />
                                    </ListItemButton>
                                </List>
                            </div>

                            <Box sx={{ flexGrow: 1 }} />

                            <div className={styles.logoutContainer}>
                                <Divider sx={{ width: '100%', mb: 2 }} className={styles.divider} />
                                {username && (
                                    <ListItemButton onClick={handleLogout} className={styles.logoutButton}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                            <LogoutIcon className={styles.logoutIconColor} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Logout"
                                            primaryTypographyProps={{ fontSize: '14px' }}
                                        />
                                    </ListItemButton>
                                )}
                            </div>
                        </>
                    )}
                </Box>
            </Drawer>

            <ActivateAccountDialog
                open={activateDialogOpen}
                onClose={handleCloseActivateDialog}
                pulsifyId={pulsifyId}
            />

            <Drawer
                anchor="right"
                open={showProfileDetails}
                onClose={handleCloseProfileDetails}
                PaperProps={{
                    sx: {
                        width: '400px',
                        backgroundColor: '#080821',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
                transitionDuration={300}
            >
                <Box className={styles.contentWrapper}>
                    <IconButton
                        onClick={handleCloseProfileDetails}
                        className={styles.backBtn}
                    >
                        <ArrowForwardIcon />
                    </IconButton>
                    <ProfileDetails onClose={handleCloseProfileDetails} />
                </Box>
            </Drawer>

            <Drawer
                anchor="right"
                open={showMusicSent}
                onClose={handleCloseMusicSent}
                PaperProps={{
                    sx: {
                        width: '400px',
                        backgroundColor: '#080821',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
                transitionDuration={300}
            >
                <Box className={styles.contentWrapper}>
                    <IconButton
                        onClick={handleCloseMusicSent}
                        className={styles.backBtn}
                    >
                        <ArrowForwardIcon />
                    </IconButton>
                    <MyMusicSent />
                </Box>
            </Drawer>

            <Drawer
                anchor="right"
                open={showAnalyse}
                onClose={handleCloseAnalyse}
                PaperProps={{
                    sx: {
                        width: '400px',
                        backgroundColor: '#080821',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                    }
                }}
                transitionDuration={300}
            >
                <Box className={styles.contentWrapper}>
                    <IconButton
                        onClick={handleCloseAnalyse}
                        className={styles.backBtn}
                    >
                        <ArrowForwardIcon />
                    </IconButton>

                </Box>
            </Drawer>
        </>
    );
};

export default Profile;