import React from 'react';
import { Drawer, Avatar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Button, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ReportIcon from '@mui/icons-material/Report';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUser, selectCurrentAvatar, logout } from '../store/authStore';
import styles from '../styles/Profile.module.css';

interface ProfileProps {
    open: boolean;
    onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ open, onClose }) => {
    const username = useAppSelector(selectCurrentUser);
    const userAvatar = useAppSelector(selectCurrentAvatar);
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        onClose();
    };

    const handleActivate = () => {
        // Logique d'activation du compte
        console.log("Activer le compte");
    };

    return (
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
                <div>
                    <div className={styles.profileInfo}>
                        <IconButton onClick={onClose} className={styles.backButton}>
                            <ArrowForwardIcon />
                        </IconButton>

                        <Avatar
                            src={userAvatar || undefined}
                            alt={username || 'Utilisateur'}
                            className={styles.avatar}
                        />
                        <Typography variant="h5" className={styles.profileName}>
                            {username || 'Invité'}
                        </Typography>
                    </div>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            startIcon={<VerifiedUserIcon />}
                            onClick={handleActivate}
                            className={styles.activateButton}
                        >
                            Activate Account
                        </Button>
                    </Box>

                    <Divider className={styles.divider} />

                    <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ListItemButton className={styles.listItemButton}>
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                <PersonIcon className={styles.iconColor} />
                            </ListItemIcon>
                            <ListItemText primary="profile" />
                        </ListItemButton>
                        <ListItemButton className={styles.listItemButton}>
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                <HistoryIcon className={styles.iconColor} />
                            </ListItemIcon>
                            <ListItemText primary="music sent history" />
                        </ListItemButton>
                        <ListItemButton className={styles.listItemButton}>
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                <ReportIcon className={styles.iconColor} />
                            </ListItemIcon>
                            <ListItemText primary="reports" />
                        </ListItemButton>
                        <ListItemButton className={styles.listItemButton}>
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                <SettingsIcon className={styles.iconColor} />
                            </ListItemIcon>
                            <ListItemText primary="settings" />
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
                                primary="Déconnexion"
                                primaryTypographyProps={{ fontSize: '14px' }}
                            />
                        </ListItemButton>
                    )}
                </div>
            </Box>
        </Drawer>
    );
};

export default Profile;