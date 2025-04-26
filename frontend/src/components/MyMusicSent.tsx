import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, IconButton } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUserId } from '../store/authStore';
import styles from '../styles/ProfileDetails.module.css';
import Axios from '../utils/Axios';
import LightSunoCard from '../LightSunoCard';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

const MyMusicSent = () => {
    const [songs, setSongs] = useState<SunoSong[]>([]);
    const [sunoLink, setSunoLink] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [clickedPlusButton, setClickedPlusButton] = useState<boolean>(false);
    const userId = useAppSelector(selectCurrentUserId);
    const { enqueueSnackbar } = useSnackbar();

    const SUNO_LINK_REGEX = /suno\.(ai|com)\/song\/([a-f0-9-]+)/i;

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
            enqueueSnackbar('Invalid Suno link format', { variant: 'error' });
        }
    };

    const handleSubmitSong = async () => {
        if (!sunoLink) {
            enqueueSnackbar('Please enter a Suno link', { variant: 'warning' });
            return;
        }

        if (!validateSunoLink(sunoLink)) {
            enqueueSnackbar('Invalid Suno link format', { variant: 'error' });
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await Axios.post('/songs', { sunoLink });
            setSunoLink("");
            setClickedPlusButton(false);
            enqueueSnackbar('Song added successfully!', { variant: 'success' });
            // Refresh songs list
            const response = await Axios.get(`/users/${userId}/songs`);
            setSongs(response.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.message || 'Error adding the song',
                { variant: 'error' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSong = async (songId: string) => {
        try {
            await Axios.delete(`/songs/${songId}`);
            setSongs(songs.filter(song => song.id !== songId));
            enqueueSnackbar('Song deleted successfully', { variant: 'success' });
        } catch (error) {
            console.error("Error deleting song:", error);
            enqueueSnackbar('Error deleting the song', { variant: 'error' });
        }
    };

    let sunoLinkContainer = clickedPlusButton ? (
        <div className={styles.inputSunoLinkContainer}>
            <input
                placeholder="Paste your Suno link here..."
                className={styles.inputSunoLink}
                onChange={handleInputChange}
                value={sunoLink}
            />
            <button
                className={styles.plusButton}
                onClick={handleSubmitSong}
                disabled={isSubmitting}
            />
        </div>
    ) : (
        <button
            className={styles.openPlusButton}
            onClick={() => setClickedPlusButton(true)}
        />
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
                                                <Box className={styles.cardAndDelete}>
                                                    <LightSunoCard {...song} />
                                                    <IconButton
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteSong(song.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                                <Box className={styles.radioStats}>
                                                    <Typography variant="body2" className={styles.statItem}>
                                                        <span className={styles.statLabel}>Radio Votes:</span>
                                                        <span className={styles.statValue}>{song.radioVoteCount}</span>
                                                    </Typography>
                                                    <Typography variant="body2" className={styles.statItem}>
                                                        <span className={styles.statLabel}>Radio Plays:</span>
                                                        <span className={styles.statValue}>{song.radioPlayCount}</span>
                                                    </Typography>
                                                    <Typography variant="body2" className={styles.statItem}>
                                                        <span className={styles.statLabel}>Next Play:</span>
                                                        <span className={styles.statValue}>{song.timeUntilPlay || "Coming soon"}</span>
                                                    </Typography>
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
                            {!clickedPlusButton ? "Add a song" : "Paste your Suno link"}
                        </div>
                    </Box>
                </Stack>
            </Box>
        </div>
    );
};

export default MyMusicSent;