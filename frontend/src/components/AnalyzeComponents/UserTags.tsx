import React, { useState } from 'react';
import styles from '../../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const UserTags: React.FC = () => {
    const [selectedUserSegment, setSelectedUserSegment] = useState('All Users');
    const [searchQuery, setSearchQuery] = useState('');

    const handleUserSegmentChange = (event: any) => {
        setSelectedUserSegment(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const userSegmentOptions = ['All Users', 'Active Users', 'New Users', 'Power Users', 'Inactive Users'];

    // Tags simulés par catégorie pour les utilisateurs
    const userTagCategories = [
        {
            category: "Comportement",
            tags: ["Actif", "Inactif", "Occasionnel", "Fidèle", "Nouveau", "Modérateur", "Contributeur", "Explorateur"]
        },
        {
            category: "Préférences",
            tags: ["Pop", "Rock", "Hip Hop", "Électronique", "Jazz", "Classical", "Indie", "Metal"]
        },
        {
            category: "Démographie",
            tags: ["18-24", "25-34", "35-44", "45-54", "55+", "Étudiant", "Professionnel", "Artiste"]
        },
        {
            category: "Régions",
            tags: ["Europe", "Amérique du Nord", "Amérique du Sud", "Asie", "Afrique", "Océanie", "France", "USA"]
        },
        {
            category: "Activité",
            tags: ["Créateur de playlists", "Dénicheur", "Commentateur", "Partageur", "Curateur", "Auditeur nocturne"]
        }
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search user tags..."
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
                    {userTagCategories.map((category, index) => (
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
                    <span>User Segments</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedUserSegment}
                            onChange={handleUserSegmentChange}
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
                            {userSegmentOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </div>

                <div className={styles.userSegmentStats}>
                    <div className={styles.segmentHeader}>
                        <PersonIcon fontSize="small" />
                        <span>Tag Distribution</span>
                    </div>

                    <div className={styles.segmentItem}>
                        <span className={styles.tagName}>Actif</span>
                        <div className={styles.tagBar}>
                            <div className={styles.tagProgress} style={{ width: '72%' }}></div>
                            <span className={styles.tagPercent}>72%</span>
                        </div>
                    </div>

                    <div className={styles.segmentItem}>
                        <span className={styles.tagName}>Pop</span>
                        <div className={styles.tagBar}>
                            <div className={styles.tagProgress} style={{ width: '65%' }}></div>
                            <span className={styles.tagPercent}>65%</span>
                        </div>
                    </div>

                    <div className={styles.segmentItem}>
                        <span className={styles.tagName}>18-24</span>
                        <div className={styles.tagBar}>
                            <div className={styles.tagProgress} style={{ width: '48%' }}></div>
                            <span className={styles.tagPercent}>48%</span>
                        </div>
                    </div>

                    <div className={styles.segmentItem}>
                        <span className={styles.tagName}>Europe</span>
                        <div className={styles.tagBar}>
                            <div className={styles.tagProgress} style={{ width: '41%' }}></div>
                            <span className={styles.tagPercent}>41%</span>
                        </div>
                    </div>

                    <div className={styles.segmentItem}>
                        <span className={styles.tagName}>Créateur de playlists</span>
                        <div className={styles.tagBar}>
                            <div className={styles.tagProgress} style={{ width: '35%' }}></div>
                            <span className={styles.tagPercent}>35%</span>
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

export default UserTags; 