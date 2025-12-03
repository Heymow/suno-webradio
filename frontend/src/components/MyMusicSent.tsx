import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, IconButton } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUserId, updateUserProfile } from '../store/authStore';
import styles from '../styles/MyMusicSent.module.css';
import Axios from '../utils/Axios';
import LightSunoCard from './LightSunoCard';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import DeleteConfirmationDialog from './dialog/DeleteConfirmationDialog';
import { submitSunoLink } from '../services/suno.services';
import { SunoSong } from '../types/Suno.types';

// Constants
const ERROR_MESSAGES = {
    INVALID_LINK: 'Invalid Suno link format. Example: https://suno.ai/song/123... or https://suno.com/song/123...',
    EMPTY_LINK: 'Please enter a Suno link'
};

const SUNO_LINK_REGEX = /suno\.(ai|com)\/song\/([a-f0-9-]+)/i;

const MyMusicSent = () => {
    const [songs, setSongs] = useState<SunoSong[]>([]);
    const [sunoLink, setSunoLink] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [clickedPlusButton, setClickedPlusButton] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [songToDelete, setSongToDelete] = useState<SunoSong | null>(null);
    const userId = useAppSelector(selectCurrentUserId);
    const dispatch = useAppDispatch();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchUserSongs = async () => {
            if (!userId) return;

            try {
                const response = await Axios.get(`/users/${userId}/my-music-sent`);
                setSongs(response.data);
            } catch (error) {
                console.error("Error fetching songs:", error);
                enqueueSnackbar("Error fetching your songs", { variant: 'error' });
            }
        };

        fetchUserSongs();
    }, [userId, enqueueSnackbar]);

    const validateSunoLink = (link: string): boolean => {
        return !!link.match(SUNO_LINK_REGEX);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLink = e.target.value;
        setSunoLink(newLink);

        if (newLink && !validateSunoLink(newLink)) {
            enqueueSnackbar(ERROR_MESSAGES.INVALID_LINK, {
                variant: 'error',
                preventDuplicate: true
            });
        }
    };

    const handleSubmitSong = async () => {
        if (!sunoLink) {
            enqueueSnackbar(ERROR_MESSAGES.EMPTY_LINK, { variant: 'warning' });
            return;
        }

        if (!validateSunoLink(sunoLink)) {
            enqueueSnackbar(ERROR_MESSAGES.INVALID_LINK, { variant: 'error' });
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await submitSunoLink(sunoLink);

            // Update user profile if data is returned
            if (response.user) {
                dispatch(updateUserProfile({
                    sunoUsername: response.user.sunoUsername,
                    avatar: response.user.avatar,
                    isActivated: response.user.isActivated
                }));
            }

            setSunoLink("");
            setClickedPlusButton(false);
            enqueueSnackbar('Song added successfully!', { variant: 'success' });
            // Refresh songs list
            const songsResponse = await Axios.get(`/users/${userId}/my-music-sent`);
            setSongs(songsResponse.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.message || 'Error adding song',
                { variant: 'error' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (song: SunoSong) => {
        setSongToDelete(song);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!songToDelete) return;

        try {
            await Axios.delete(`/users/${userId}/my-music-sent/${songToDelete._id}`);
            setSongs(songs.filter(song => song._id !== songToDelete._id));
            enqueueSnackbar('Song deleted successfully', { variant: 'success' });
        } catch (error) {
            console.error("Error deleting song:", error);
            enqueueSnackbar('Error deleting song', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
            setSongToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSongToDelete(null);
    };

    let sunoLinkContainer = clickedPlusButton ? (
        <div className={styles.inputSunoLinkContainer}>
            <input
                placeholder="Paste your Suno song link here for adding to the playlist 'New'..."
                className={styles.inputSunoLink}
                onChange={handleInputChange}
                value={sunoLink}
            />
            <button
                className={styles.plusButton}
                onClick={handleSubmitSong}
                disabled={isSubmitting}
            >
                {isSubmitting ? "..." : "+"}
            </button>
        </div>
    ) : (
        <button
            className={styles.openPlusButton}
            onClick={() => setClickedPlusButton(true)}
        >
            +
        </button>
    );

    return (
        <div className={styles.profileDetailsContainer}>
            <Box className={styles.profileDetailsContent}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h5" className={styles.detailTitle}>
                            My Music
                        </Typography>
                    </Box>

                    <Box className={styles.songsContainer}>
                        {[...Array(3)].map((_, index) => {
                            const song = songs[index];
                            return (
                                <Box key={index} className={styles.songItem}>
                                    {song ? (
                                        <Box className={styles.usedSlotCard}>
                                            <Box className={styles.songCardContainer}>
                                                <Box className={styles.lightSunoCardWrapper}>
                                                    <LightSunoCard
                                                        {...song}
                                                        playCount={song.playCount}
                                                        upVoteCount={song.upVoteCount}
                                                    />
                                                </Box>
                                                <Box className={styles.radioStats}>
                                                    <Typography variant="body2" className={styles.statItem} sx={{ flexDirection: 'row', gap: '8px', width: '100%', justifyContent: 'center' }}>
                                                        <span className={styles.statLabel}>Next Play:</span>
                                                        <span className={styles.statValue}>{song.timeUntilPlay || "Coming soon"}</span>
                                                    </Typography>
                                                </Box>
                                                <Box className={styles.deleteButtonContainer}>
                                                    <IconButton
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteClick(song)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box className={styles.placeholderCard}>
                                            <Typography variant="body1" className={styles.placeholderText}>
                                                Slot {index + 1}/3
                                            </Typography>
                                            <Typography variant="body2" className={styles.placeholderSubtext}>
                                                Add a song to fill this slot
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    <Box className={styles.addSongContainer}>
                        {sunoLinkContainer}
                        <div className={styles.explanatoryText}>
                            {!clickedPlusButton ? "Add a song to the playlist 'New'" : ""}
                        </div>
                    </Box>
                </Stack>
            </Box>
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title={songToDelete?.name || ''}
            />
        </div>
    );
};

export default MyMusicSent;