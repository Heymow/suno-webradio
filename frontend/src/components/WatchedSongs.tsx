import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import styles from '../styles/WatchedSongs.module.css';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUserId } from '../store/authStore';
import Axios from '../utils/Axios';
import { useSnackbar } from 'notistack';

interface AnalyseItem {
    id: string;
    title: string;
    date: string;
    sunoLink: string;
    author: string;
    duration: number;
    lyrics: string;
    prompt: string;
    negative: string[];
    songImage: string;
    avatarImage: string;
    modelVersion: string;
    playCount: number;
    upVoteCount: number;
}

const Analyse: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analyses, setAnalyses] = useState<AnalyseItem[]>([]);
    const [sunoLink, setSunoLink] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [clickedPlusButton, setClickedPlusButton] = useState<boolean>(false);
    const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
    const userId = useAppSelector(selectCurrentUserId);
    const { enqueueSnackbar } = useSnackbar();

    const SUNO_LINK_REGEX = /suno\.(ai|com)\/song\/([a-f0-9-]+)/i;

    useEffect(() => {
        fetchAnalyses();
    }, [userId]);

    const fetchAnalyses = async () => {
        if (!userId) {
            setError('Utilisateur non connecté');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await Axios.get(`/users/${userId}/analyses`);
            setAnalyses(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des analyses');
            console.error('Error fetching analyses:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateSunoLink = (link: string): boolean => {
        return !!link.match(SUNO_LINK_REGEX);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLink = e.target.value;
        setSunoLink(newLink);

        if (newLink && !validateSunoLink(newLink)) {
            enqueueSnackbar('Format de lien Suno invalide', { variant: 'error' });
        }
    };

    const handleAddAnalyse = async () => {
        if (!sunoLink) {
            enqueueSnackbar('Veuillez entrer un lien Suno', { variant: 'warning' });
            return;
        }

        if (!validateSunoLink(sunoLink)) {
            enqueueSnackbar('Format de lien Suno invalide', { variant: 'error' });
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Récupérer les informations du morceau depuis l'API Suno
            const sunoId = sunoLink.match(SUNO_LINK_REGEX)?.[2];
            const sunoResponse = await Axios.get(`/suno/clip/${sunoId}`);

            if (!sunoResponse.data.result) {
                throw new Error('Impossible de récupérer les informations du morceau');
            }

            const sunoData = sunoResponse.data.project;

            // Créer l'analyse avec les informations complètes
            const response = await Axios.post(`/users/${userId}/analyses`, {
                sunoLink,
                title: sunoData.name,
                author: sunoData.author,
                duration: sunoData.duration,
                lyrics: sunoData.lyrics,
                prompt: sunoData.prompt,
                negative: sunoData.negative,
                songImage: sunoData.songImage,
                avatarImage: sunoData.avatarImage,
                modelVersion: sunoData.modelVersion,
                playCount: sunoData.playCount,
                upVoteCount: sunoData.upVoteCount
            });

            setAnalyses(prev => [...prev, response.data]);
            setSunoLink("");
            setClickedPlusButton(false);
            enqueueSnackbar('Analyse ajoutée avec succès !', { variant: 'success' });
        } catch (err) {
            console.error('Error adding analyse:', err);
            enqueueSnackbar('Erreur lors de l\'ajout de l\'analyse', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnalyse = async (analyseId: string) => {
        try {
            await Axios.delete(`/users/${userId}/analyses/${analyseId}`);
            setAnalyses(analyses.filter(analyse => analyse.id !== analyseId));
            enqueueSnackbar('Analyse supprimée avec succès', { variant: 'success' });
        } catch (error) {
            console.error("Error deleting analyse:", error);
            enqueueSnackbar('Erreur lors de la suppression de l\'analyse', { variant: 'error' });
        }
    };

    const toggleCard = (analyseId: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [analyseId]: !prev[analyseId]
        }));
    };

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className={styles.errorContainer}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

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
                onClick={handleAddAnalyse}
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
        <Box className={styles.container}>
            <Typography variant="h5" className={styles.title}>
                Mes Analyses
            </Typography>
            <Box className={styles.songsContainer}>
                {analyses.map((analyse) => (
                    <Box key={analyse.id} className={styles.songCard}>
                        <Box className={styles.cardContent}>
                            <Box className={styles.songImageContainer}>
                                <img src={analyse.songImage} alt={analyse.title} className={styles.songImage} />
                            </Box>
                            <Box className={styles.songInfo}>
                                <Box className={styles.songHeader}>
                                    <Box className={styles.songTitleContainer}>
                                        <Typography variant="h6" className={styles.songTitle}>
                                            {analyse.title}
                                        </Typography>
                                        <Typography variant="body2" className={styles.songAuthor}>
                                            {analyse.author}
                                        </Typography>
                                    </Box>
                                    <Box className={styles.songActions}>
                                        <IconButton
                                            className={styles.expandButton}
                                            onClick={() => toggleCard(analyse.id)}
                                        >
                                            {expandedCards[analyse.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                        <IconButton
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteAnalyse(analyse.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box className={styles.songBasicInfo}>
                                    <Typography variant="body2" className={styles.songDate}>
                                        {new Date(analyse.date).toLocaleDateString()}
                                    </Typography>
                                    <Box className={styles.songStats}>
                                        <Typography variant="caption" className={styles.songStat}>
                                            Durée: {Math.floor(analyse.duration / 60)}:{(Math.floor(analyse.duration % 60)).toString().padStart(2, '0')}
                                        </Typography>
                                        <Typography variant="caption" className={styles.songStat}>
                                            Écoutes: {analyse.playCount}
                                        </Typography>
                                        <Typography variant="caption" className={styles.songStat}>
                                            Votes: {analyse.upVoteCount}
                                        </Typography>
                                    </Box>
                                </Box>
                                {expandedCards[analyse.id] && (
                                    <Box className={styles.songDetails}>
                                        <Typography variant="body2" className={styles.songPrompt}>
                                            Prompt: {analyse.prompt}
                                        </Typography>
                                        {analyse.negative && analyse.negative.length > 0 && (
                                            <Typography variant="body2" className={styles.songNegative}>
                                                Negative: {analyse.negative.join(', ')}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                ))}
                {[...Array(5 - analyses.length)].map((_, index) => (
                    <Box key={`placeholder-${index}`} className={styles.placeholderCard}>
                        <Typography variant="body1" className={styles.placeholderText}>
                            Slot {analyses.length + index + 1}/5
                        </Typography>
                        <Typography variant="body2" className={styles.placeholderSubtext}>
                            Add an analysis to fill this slot
                        </Typography>
                    </Box>
                ))}
                {analyses.length < 5 && (
                    <Box className={styles.addSongContainer}>
                        {sunoLinkContainer}
                        <div className={styles.explanatoryText}>
                            {!clickedPlusButton ? "Add an analysis" : "Paste your Suno link"}
                        </div>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Analyse;
