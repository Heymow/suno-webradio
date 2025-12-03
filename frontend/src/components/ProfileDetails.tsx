import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Stack } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { selectCurrentAvatar, selectCurrentUserId } from '../store/authStore';
import styles from '../styles/ProfileDetails.module.css';
import Axios from '../utils/Axios';

interface ProfileDetailsProps {
    onClose: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ onClose }) => {
    const [sunoUsername, setSunoUsername] = useState<string>("");
    const [likesRemainingToday, setLikesRemainingToday] = useState<number>(10);
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const userAvatar = useAppSelector(selectCurrentAvatar);
    const userId = useAppSelector(selectCurrentUserId);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId) {
                setError("Unable to retrieve profile information");
                return;
            }

            try {
                const response = await Axios.get(`/users/${userId}`);
                setUsername(response.data.username);
                setSunoUsername(response.data.sunoUsername);
                setEmail(response.data.email);
                setLikesRemainingToday(response.data.likesRemainingToday);
            } catch (error) {
                console.error("Error fetching details:", error);
                setError("Error fetching information");
            }
        };

        fetchUserDetails();
    }, [userId]);

    return (
        <Paper
            className={styles.profileDetailsContainer}
            sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none'
            }}
        >
            <Box className={styles.profileDetailsContent}>
                <Stack spacing={3}>
                    <Box className={styles.avatarContainer}>
                        <Avatar
                            src={userAvatar || undefined}
                            alt={username || 'User'}
                            className={styles.largeAvatar}
                        />
                    </Box>

                    <Box>
                        <Typography variant="h5" className={styles.detailTitle}>
                            Profile Information
                        </Typography>
                    </Box>

                    <Box>
                        <Typography className={styles.detailLabel}>Username</Typography>
                        <Typography className={styles.detailValue}>{username || 'Not defined'}</Typography>
                    </Box>

                    <Box>
                        <Typography className={styles.detailLabel}>Email</Typography>
                        <Typography className={styles.detailValue}>{email || 'Not defined'}</Typography>
                    </Box>

                    <Box>
                        <Typography className={styles.detailLabel}>Suno Account</Typography>
                        <Typography className={styles.detailValue}>{sunoUsername}</Typography>
                    </Box>

                    <Box>
                        <Typography className={styles.detailLabel}>Likes remaining today</Typography>
                        <Typography className={styles.detailValue}>{likesRemainingToday}/10</Typography>
                    </Box>

                    {error && (
                        <Box>
                            <Typography color="error" className={styles.errorMessage}>
                                {error}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

export default ProfileDetails; 