import React, { useState } from 'react';
import styles from '../../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

const PlaylistTags: React.FC = () => {
    const [selectedViewMode, setSelectedViewMode] = useState('All Tags');
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewModeChange = (event: any) => {
        setSelectedViewMode(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const viewModeOptions = ['All Tags', 'Editorial', 'User-Generated', 'Most Used', 'Trending'];

    // Tags simulés par catégorie pour les playlists
    const playlistTagCategories = [
        {
            category: "Moments",
            tags: ["Morning", "Workout", "Focus", "Commute", "Relaxation", "Party", "Dinner", "Sleep"]
        },
        {
            category: "Ambiance",
            tags: ["Chill", "Energetic", "Happy", "Nostalgic", "Atmospheric", "Romantic", "Dark", "Uplifting"]
        },
        {
            category: "Genres",
            tags: ["Pop", "Rock", "Hip Hop", "Électronique", "Jazz", "Classical", "Indie", "Metal"]
        },
        {
            category: "Occasions",
            tags: ["Weekend", "Study", "Meditation", "Cooking", "Running", "Yoga", "Road Trip", "Beach"]
        },
        {
            category: "Décennie",
            tags: ["2020s", "2010s", "2000s", "90s", "80s", "70s", "60s", "Classics"]
        }
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search playlist tags..."
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

                <div className={styles.tagsContainer}>
                    {playlistTagCategories.map((category, index) => (
                        <div key={index} className={styles.tagCategoryCard}>
                            <div className={styles.tagCategoryHeader}>
                                <h3>{category.category}</h3>
                                <LocalOfferIcon />
                            </div>
                            <div className={styles.tagsList}>
                                {category.tags.map((tag, tagIndex) => (
                                    <StyledChip
                                        key={tagIndex}
                                        label={tag}
                                        icon={<LocalOfferIcon style={{ fontSize: '0.8rem' }} />}
                                        clickable
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>Tag View Mode</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedViewMode}
                            onChange={handleViewModeChange}
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
                            {viewModeOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </div>

                <div className={styles.tagUsageInfo}>
                    <div className={styles.tagUsageHeader}>Most Popular Tags</div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Chill</span>
                        <span className={styles.tagCount}>3,756</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Focus</span>
                        <span className={styles.tagCount}>2,945</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Workout</span>
                        <span className={styles.tagCount}>2,832</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Pop</span>
                        <span className={styles.tagCount}>2,415</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Morning</span>
                        <span className={styles.tagCount}>2,156</span>
                    </div>
                </div>

                <div className={styles.playlistSuggestion}>
                    <div className={styles.suggestHeader}>
                        <QueueMusicIcon fontSize="small" />
                        <span>Popular by Tag</span>
                    </div>
                    <div className={styles.suggestContent}>
                        <div className={styles.tagName}>Focus</div>
                        <div className={styles.suggestPlaylists}>
                            <div className={styles.suggestItem}>Electronic Focus</div>
                            <div className={styles.suggestItem}>Deep Concentration</div>
                            <div className={styles.suggestItem}>Study Beats</div>
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

const StyledChip = styled(Chip)({
    margin: '4px',
    backgroundColor: 'rgba(37, 29, 185, 0.6)',
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(37, 29, 185, 0.8)',
    },
    '& .MuiChip-icon': {
        color: 'white',
    }
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

export default PlaylistTags; 