import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const TrendingContent: React.FC = () => {
    const [selectedCommunity, setSelectedCommunity] = useState('Global');
    const [selectedTimeframe, setSelectedTimeframe] = useState('Now');

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
    const songs = [
        { id: 1, title: 'Track Title', artist: 'Artist Name' },
        { id: 2, title: 'Another Track', artist: 'Second Artist' },
        { id: 3, title: 'Popular Song', artist: 'Famous Artist' },
        { id: 4, title: 'New Release', artist: 'Rising Star' },
        { id: 5, title: 'Classic Hit', artist: 'Legend Band' },
        { id: 6, title: 'Summer Anthem', artist: 'Party Singer' },
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.songsGrid}>
                    {songs.map(song => (
                        <div key={song.id} className={styles.songCard}>
                            <div className={styles.songImage}></div>
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

            <div className={styles.rightSidebar}>
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

export default TrendingContent; 