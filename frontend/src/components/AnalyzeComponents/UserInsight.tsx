import React, { useState } from 'react';
import styles from '../../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import { FormControl, Select, MenuItem, TextField, InputAdornment, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const UserInsight: React.FC = () => {
    const [selectedSortBy, setSelectedSortBy] = useState('Most Active');
    const [selectedRegion, setSelectedRegion] = useState('Global');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSortByChange = (event: any) => {
        setSelectedSortBy(event.target.value);
    };

    const handleRegionChange = (event: any) => {
        setSelectedRegion(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Options pour les dropdowns
    const sortByOptions = ['Most Active', 'New Users', 'Top Contributors', 'Alphabetical'];
    const regionOptions = ['Global', 'Europe', 'North America', 'Asia', 'South America', 'Africa', 'Oceania'];

    // Données simulées pour les utilisateurs
    const users = [
        { id: 1, name: 'Sophie Martin', avatar: 'SM', region: 'France', followers: 3254, contributions: 127, joined: '2022-05-12' },
        { id: 2, name: 'Thomas Wilson', avatar: 'TW', region: 'United States', followers: 2876, contributions: 89, joined: '2022-08-03' },
        { id: 3, name: 'Emma Chen', avatar: 'EC', region: 'China', followers: 4128, contributions: 156, joined: '2021-11-24' },
        { id: 4, name: 'Lucas Dubois', avatar: 'LD', region: 'Canada', followers: 1856, contributions: 64, joined: '2023-01-15' },
        { id: 5, name: 'Sophia Rodriguez', avatar: 'SR', region: 'Spain', followers: 2045, contributions: 78, joined: '2022-09-30' },
        { id: 6, name: 'James Kim', avatar: 'JK', region: 'South Korea', followers: 3512, contributions: 112, joined: '2022-03-18' },
        { id: 7, name: 'Léa Petit', avatar: 'LP', region: 'Belgium', followers: 1325, contributions: 47, joined: '2023-02-22' },
        { id: 8, name: 'Mohammed Al-Farsi', avatar: 'MA', region: 'UAE', followers: 1987, contributions: 71, joined: '2022-07-09' },
    ];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.searchAndFilter}>
                    <StyledTextField
                        placeholder="Search users..."
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

                <div className={styles.usersList}>
                    <div className={styles.usersHeader}>
                        <div className={styles.userHeaderItem} style={{ flex: 2 }}>User</div>
                        <div className={styles.userHeaderItem} style={{ flex: 1 }}>Region</div>
                        <div className={styles.userHeaderItem} style={{ flex: 1 }}>Followers</div>
                        <div className={styles.userHeaderItem} style={{ flex: 1 }}>Contributions</div>
                        <div className={styles.userHeaderItem} style={{ flex: 1 }}>Joined</div>
                        <div className={styles.userHeaderItem} style={{ flex: 1 }}>Actions</div>
                    </div>

                    {users.map((user) => (
                        <div key={user.id} className={styles.userRow}>
                            <div className={styles.userItem} style={{ flex: 2 }}>
                                <StyledAvatar>{user.avatar}</StyledAvatar>
                                <span className={styles.userName}>{user.name}</span>
                            </div>
                            <div className={styles.userItem} style={{ flex: 1 }}>{user.region}</div>
                            <div className={styles.userItem} style={{ flex: 1 }}>{user.followers.toLocaleString()}</div>
                            <div className={styles.userItem} style={{ flex: 1 }}>{user.contributions}</div>
                            <div className={styles.userItem} style={{ flex: 1 }}>{new Date(user.joined).toLocaleDateString()}</div>
                            <div className={styles.userItem} style={{ flex: 1, justifyContent: 'space-around' }}>
                                <button className={styles.actionButton}>
                                    <PersonIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <EmailIcon fontSize="small" />
                                </button>
                                <button className={styles.actionButton}>
                                    <StarIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>User Filters</span>
                </div>
                <div className={styles.filterContainer}>
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

                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedRegion}
                            onChange={handleRegionChange}
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
                            {regionOptions.map(option => (
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

const StyledAvatar = styled(Avatar)({
    width: 32,
    height: 32,
    marginRight: 12,
    backgroundColor: 'rgba(37, 29, 185, 0.8)',
    fontSize: '0.8rem',
});

export default UserInsight; 