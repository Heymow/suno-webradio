import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormControl, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlaylistInsight: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSortBy, setSelectedSortBy] = useState('Most Popular');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryChange = (event: any) => {
        setSelectedCategory(event.target.value);
    };

    const handleSortByChange = (event: any) => {
        setSelectedSortBy(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const categoryOptions = ['All Categories', 'Pop', 'Rock', 'Hip Hop', 'Électronique', 'Jazz', 'Ambiance', 'Focus'];
    const sortByOptions = ['Most Popular', 'Recent', 'Most Listened', 'Most Shared'];

    // Données simulées pour les playlists
    const playlists = [
        { id: 1, title: 'Top Hits 2023', creator: 'Pulsify Editorial', tracks: 25, likes: 12480, plays: 45879, shares: 2546 },
        { id: 2, title: 'Chill Vibes', creator: 'Sophie Martin', tracks: 18, likes: 8975, plays: 32456, shares: 1678 },
        { id: 3, title: 'Electronic Focus', creator: 'DJ Wave', tracks: 15, likes: 7542, plays: 28974, shares: 1245 },
        { id: 4, title: 'Morning Coffee', creator: 'Thomas Wilson', tracks: 12, likes: 6589, plays: 21456, shares: 875 },
        { id: 5, title: 'Workout Mix', creator: 'Fitness Channel', tracks: 22, likes: 9874, plays: 38521, shares: 1956 },
        { id: 6, title: 'Retro Classics', creator: 'Vintage Lover', tracks: 30, likes: 11542, plays: 42365, shares: 2154 },
        { id: 7, title: 'Jazz Evening', creator: 'Smooth Tunes', tracks: 16, likes: 5487, plays: 18965, shares: 732 },
        { id: 8, title: 'Happy Vibes', creator: 'Feel Good Channel', tracks: 20, likes: 8756, plays: 31254, shares: 1654 },
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search playlists..."
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

                <div className={styles.playlistsList}>
                    <div className={styles.playlistsHeader}>
                        <div className={styles.playlistHeaderItem} style={{ flex: 3 }}>Playlist</div>
                        <div className={styles.playlistHeaderItem} style={{ flex: 2 }}>Creator</div>
                        <div className={styles.playlistHeaderItem} style={{ flex: 1 }}>Tracks</div>
                        <div className={styles.playlistHeaderItem} style={{ flex: 1 }}>Likes</div>
                        <div className={styles.playlistHeaderItem} style={{ flex: 1 }}>Plays</div>
                        <div className={styles.playlistHeaderItem} style={{ flex: 1 }}>Actions</div>
                    </div>

                    {playlists.map((playlist) => (
                        <div key={playlist.id} className={styles.playlistRow}>
                            <div className={styles.playlistItem} style={{ flex: 3 }}>
                                <div className={styles.playlistImage}></div>
                                <span className={styles.playlistTitle}>{playlist.title}</span>
                            </div>
                            <div className={styles.playlistItem} style={{ flex: 2 }}>{playlist.creator}</div>
                            <div className={styles.playlistItem} style={{ flex: 1 }}>{playlist.tracks}</div>
                            <div className={styles.playlistItem} style={{ flex: 1 }}>{playlist.likes.toLocaleString()}</div>
                            <div className={styles.playlistItem} style={{ flex: 1 }}>{playlist.plays.toLocaleString()}</div>
                            <div className={styles.playlistItem} style={{ flex: 1, justifyContent: 'space-around' }}>
                                <button className={styles.actionButton}>
                                    <QueueMusicIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <VisibilityIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <ShareIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>Playlist Filters</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
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
                            {categoryOptions.map(option => (
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

                <div className={styles.topPlaylists}>
                    <div className={styles.topPlaylistsHeader}>
                        <QueueMusicIcon fontSize="small" />
                        <span>Top Playlists</span>
                    </div>

                    <div className={styles.playlistRankingItem}>
                        <span className={styles.playlistRank}>1</span>
                        <div className={styles.playlistRankInfo}>
                            <span className={styles.playlistRankTitle}>Top Hits 2023</span>
                            <span className={styles.playlistRankCreator}>Pulsify Editorial</span>
                        </div>
                        <div className={styles.playlistStats}>
                            <div className={styles.statItem}>
                                <FavoriteIcon fontSize="small" />
                                <span>12.4k</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.playlistRankingItem}>
                        <span className={styles.playlistRank}>2</span>
                        <div className={styles.playlistRankInfo}>
                            <span className={styles.playlistRankTitle}>Workout Mix</span>
                            <span className={styles.playlistRankCreator}>Fitness Channel</span>
                        </div>
                        <div className={styles.playlistStats}>
                            <div className={styles.statItem}>
                                <FavoriteIcon fontSize="small" />
                                <span>9.8k</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.playlistRankingItem}>
                        <span className={styles.playlistRank}>3</span>
                        <div className={styles.playlistRankInfo}>
                            <span className={styles.playlistRankTitle}>Retro Classics</span>
                            <span className={styles.playlistRankCreator}>Vintage Lover</span>
                        </div>
                        <div className={styles.playlistStats}>
                            <div className={styles.statItem}>
                                <FavoriteIcon fontSize="small" />
                                <span>11.5k</span>
                            </div>
                        </div>
                    </div>
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

export default PlaylistInsight; 