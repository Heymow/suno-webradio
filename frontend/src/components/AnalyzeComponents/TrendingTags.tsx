import React, { useState } from 'react';
import styles from '../../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const TrendingTags: React.FC = () => {
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

    // Tags simulés par catégorie
    const tagCategories = [
        {
            category: "Genres",
            tags: ["Électronique", "Pop", "Hip Hop", "Rock", "Jazz", "Classique", "Indie", "Metal", "R&B", "Soul"]
        },
        {
            category: "Ambiances",
            tags: ["Dansant", "Calme", "Énergique", "Relaxant", "Mélancolique", "Joyeux", "Intense", "Romantique"]
        },
        {
            category: "Instruments",
            tags: ["Piano", "Guitare", "Batterie", "Synthétiseur", "Violon", "Basse", "Saxophone", "Vocal"]
        },
        {
            category: "Popularité",
            tags: ["Trending", "Nouveau", "Classique", "Découverte", "Viral", "Sous-estimé", "Populaire"]
        }
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.tagsContainer}>
                    {tagCategories.map((category, index) => (
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

export default TrendingTags; 