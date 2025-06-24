import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';

const SongInsight: React.FC = () => {
    const [selectedGenre, setSelectedGenre] = useState('All Genres');
    const [selectedSortBy, setSelectedSortBy] = useState('Most Played');
    const [searchQuery, setSearchQuery] = useState('');

    const handleGenreChange = (event: any) => {
        setSelectedGenre(event.target.value);
    };

    const handleSortByChange = (event: any) => {
        setSelectedSortBy(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const genreOptions = ['All Genres', 'Électronique', 'Pop', 'Hip Hop', 'Rock', 'Jazz'];
    const sortByOptions = ['Most Played', 'Recently Added', 'Highest Rated', 'Alphabetical'];

    // Données simulées pour les chansons
    const songs = [
        { id: 1, title: 'Summer Haze', artist: 'Luna Ray', duration: '3:45', playCount: 12458, rating: 4.8 },
        { id: 2, title: 'Midnight Dreams', artist: 'Electric Soul', duration: '4:12', playCount: 9872, rating: 4.5 },
        { id: 3, title: 'Urban Jungle', artist: 'Beat Masters', duration: '3:28', playCount: 8754, rating: 4.6 },
        { id: 4, title: 'Echoes of You', artist: 'Sarah Blue', duration: '5:02', playCount: 7985, rating: 4.9 },
        { id: 5, title: 'Neon Lights', artist: 'Synthwave', duration: '3:56', playCount: 6547, rating: 4.3 },
        { id: 6, title: 'Cosmic Voyage', artist: 'Star Collective', duration: '6:18', playCount: 5478, rating: 4.7 },
        { id: 7, title: 'Rainy Day', artist: 'Ambient Flow', duration: '4:35', playCount: 4875, rating: 4.4 },
        { id: 8, title: 'Dancing Machine', artist: 'Groove Theory', duration: '3:12', playCount: 4125, rating: 4.2 },
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search songs..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: 'white' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </div>

                <div className={styles.songsList}>
                    <div className={styles.songsHeader}>
                        <div className={styles.songHeaderItem} style={{ flex: 0.5 }}>#</div>
                        <div className={styles.songHeaderItem} style={{ flex: 3 }}>Title</div>
                        <div className={styles.songHeaderItem} style={{ flex: 2 }}>Artist</div>
                        <div className={styles.songHeaderItem} style={{ flex: 1 }}>Duration</div>
                        <div className={styles.songHeaderItem} style={{ flex: 1 }}>Plays</div>
                        <div className={styles.songHeaderItem} style={{ flex: 1 }}>Rating</div>
                        <div className={styles.songHeaderItem} style={{ flex: 1 }}>Actions</div>
                    </div>

                    {songs.map((song, index) => (
                        <div key={song.id} className={styles.songRow}>
                            <div className={styles.songItem} style={{ flex: 0.5 }}>{index + 1}</div>
                            <div className={styles.songItem} style={{ flex: 3 }}>{song.title}</div>
                            <div className={styles.songItem} style={{ flex: 2 }}>{song.artist}</div>
                            <div className={styles.songItem} style={{ flex: 1 }}>{song.duration}</div>
                            <div className={styles.songItem} style={{ flex: 1 }}>{song.playCount.toLocaleString()}</div>
                            <div className={styles.songItem} style={{ flex: 1 }}>{song.rating}</div>
                            <div className={styles.songItem} style={{ flex: 1, justifyContent: 'space-around' }}>
                                <button className={styles.actionButton}>
                                    <BarChartIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <PlayArrowIcon fontSize="small" />
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
                    <span>Song Filters</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedGenre}
                            onChange={handleGenreChange}
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
                            {genreOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>

                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedSortBy}
                            onChange={handleSortByChange}
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
                            {sortByOptions.map(option => (
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
    minWidth: 120,
    maxWidth: 150,
    margin: '0 5px',
    overflow: 'hidden',
    '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': {
            borderColor: 'rgba(255,255,255,0.2)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.3)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(255,255,255,0.5)',
        },
        backgroundColor: 'rgba(25, 25, 35, 0.5)',
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

const StyledTextField = styled(TextField)({
    width: '300px',
    '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': {
            borderColor: 'rgba(255,255,255,0.2)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.3)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(255,255,255,0.5)',
        },
        backgroundColor: 'rgba(25, 25, 35, 0.5)',
    },
    '& .MuiInputBase-input': {
        padding: '8px 12px',
    }
});

export default SongInsight; 