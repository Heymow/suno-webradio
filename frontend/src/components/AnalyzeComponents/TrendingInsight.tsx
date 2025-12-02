import React, { useEffect, useState } from 'react';
import styles from './TrendingInsight.module.css';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircularProgress from '@mui/material/CircularProgress';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import Axios from '../../utils/Axios';

// Interface pour la chanson
interface SongData {
    id: number;
    title: string;
    artist: string;
    image?: string;
}

const TrendingInsight: React.FC = () => {
    const [selectedCommunity, setSelectedCommunity] = useState('Global');
    const [selectedTimeframe, setSelectedTimeframe] = useState('Now');
    const [trendingSongs, setTrendingSongs] = useState<SongData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleCommunityChange = (event: any) => {
        setSelectedCommunity(event.target.value);
    };

    const handleTimeframeChange = (event: any) => {
        setSelectedTimeframe(event.target.value);
    };

    // Options pour les dropdowns
    const communityOptions = ['Community', 'French', 'English', 'Global'];
    const timeframeOptions = ['Now', 'Today', 'This Week', 'This Month'];

    // Données simulées pour les cartes
    const fallbackSongs: SongData[] = [
        { id: 1, title: 'Track Title', artist: 'Artist Name' },
        { id: 2, title: 'Another Track', artist: 'Second Artist' },
        { id: 3, title: 'Popular Song', artist: 'Famous Artist' },
        { id: 4, title: 'New Release', artist: 'Rising Star' },
        { id: 5, title: 'Classic Hit', artist: 'Legend Band' },
        { id: 6, title: 'Summer Anthem', artist: 'Party Singer' },
    ];

    useEffect(() => {
        const fetchTrendingSongs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await Axios.get(`http://localhost:3000/trending/${selectedCommunity}/${selectedTimeframe}`);
                setTrendingSongs(response.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des tendances:", err);
                setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
                // Utiliser les données de fallback en cas d'erreur
                setTrendingSongs(fallbackSongs);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrendingSongs();
    }, [selectedCommunity, selectedTimeframe]);

    return (
        <>
            <div className={styles.contentContainer}>
                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <CircularProgress />
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p>Erreur: {error.message}</p>
                        <p>Affichage des données de démonstration.</p>
                    </div>
                ) : null}

                <div className={styles.songsGrid}>
                    {(trendingSongs.length > 0 ? trendingSongs : fallbackSongs).map((song) => (
                        <div key={song.id} className={styles.songCard}>
                            <div className={styles.songImage}>
                                {song.image && <img src={song.image} alt={song.title} />}
                            </div>
                            <div className={styles.songInfo}>
                                <div className={styles.songTitle}>{song.title}</div>
                                <div className={styles.songArtist}>{song.artist}</div>
                            </div>
                            <div className={styles.songActions}>
                                <button className={styles.actionButton}>
                                    <BarChartIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <PlayArrowIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <VolumeUpIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <FolderIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.sidebarContainer}>
                <div className={styles.filterHeader}>
                    <span>Trending Selection</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedCommunity}
                            onChange={handleCommunityChange}
                            IconComponent={KeyboardArrowDownIcon}
                            className={styles.muiSelect}
                            MenuProps={{
                                classes: { paper: styles.menuPaper },
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                        >
                            {communityOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>

                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedTimeframe}
                            onChange={handleTimeframeChange}
                            IconComponent={KeyboardArrowDownIcon}
                            className={styles.muiSelect}
                            MenuProps={{
                                classes: { paper: styles.menuPaper },
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                        >
                            {timeframeOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </div>
            </div>
        </>
    );
};

// Styled components pour les éléments MUI
const StyledFormControl = styled(FormControl)({
    minWidth: 100,
    maxWidth: 130,
    margin: '0 5px',
    overflow: 'hidden',
    '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': {
            borderColor: 'transparent',
        },
        '&:hover fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'transparent',
        },
        backgroundColor: 'transparent',
    },
    '& .MuiSelect-select': {
        padding: '8px 8px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    '& .MuiSvgIcon-root': {
        color: 'white',
        right: '0px',
    },
});

export default TrendingInsight; 