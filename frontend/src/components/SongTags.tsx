import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';

const SongTags: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState('Most Used');
    const [searchQuery, setSearchQuery] = useState('');

    const handleOrderChange = (event: any) => {
        setSelectedOrder(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const orderOptions = ['Most Used', 'Alphabetical', 'Recently Added', 'Trending'];

    // Tags simulés par catégorie pour les chansons
    const songTagCategories = [
        {
            category: "Genres",
            tags: ["Électronique", "Pop", "Hip Hop", "Rock", "Jazz", "R&B", "Soul", "Funk", "Country", "Reggae"]
        },
        {
            category: "Mood",
            tags: ["Happy", "Sad", "Energetic", "Calm", "Romantic", "Nostalgic", "Dark", "Uplifting"]
        },
        {
            category: "BPM",
            tags: ["Slow < 80", "Medium 80-120", "Fast 120-160", "Very Fast > 160"]
        },
        {
            category: "Production",
            tags: ["Bass Heavy", "Vocal Lead", "Instrumental", "Live Recording", "Lo-fi", "Hi-fi", "Acoustic"]
        },
        {
            category: "Era",
            tags: ["2020s", "2010s", "2000s", "90s", "80s", "70s", "60s", "Classic"]
        }
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search tags..."
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
                    {songTagCategories.map((category, index) => (
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
                    <span>Tag Filters</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedOrder}
                            onChange={handleOrderChange}
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
                            {orderOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </div>

                <div className={styles.tagUsageInfo}>
                    <div className={styles.tagUsageHeader}>Most Used Tags</div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Pop</span>
                        <span className={styles.tagCount}>2,458</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Electronic</span>
                        <span className={styles.tagCount}>1,985</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Hip Hop</span>
                        <span className={styles.tagCount}>1,723</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Rock</span>
                        <span className={styles.tagCount}>1,556</span>
                    </div>
                    <div className={styles.tagUsageItem}>
                        <span className={styles.tagName}>Energetic</span>
                        <span className={styles.tagCount}>1,245</span>
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

export default SongTags; 