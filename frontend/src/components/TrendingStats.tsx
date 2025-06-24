import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';

const TrendingStats: React.FC = () => {
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

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.statsContainer}>
                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Tendances d'écoute</h3>
                            <BarChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Nombre total d'écoutes: <strong>24,387</strong></p>
                            <p>Augmentation depuis la semaine dernière: <strong>+12%</strong></p>
                            <div className={styles.barChart}>
                                <div className={styles.barChartBar} style={{ width: '80%' }}>Lundi</div>
                                <div className={styles.barChartBar} style={{ width: '65%' }}>Mardi</div>
                                <div className={styles.barChartBar} style={{ width: '90%' }}>Mercredi</div>
                                <div className={styles.barChartBar} style={{ width: '75%' }}>Jeudi</div>
                                <div className={styles.barChartBar} style={{ width: '95%' }}>Vendredi</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Genres populaires</h3>
                            <PieChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Genre le plus populaire: <strong>Électro</strong></p>
                            <p>Second genre: <strong>Hip Hop</strong></p>
                            <div className={styles.pieChart}>
                                <div className={styles.pieSegment1}></div>
                                <div className={styles.pieSegment2}></div>
                                <div className={styles.pieSegment3}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Artistes en tendance</h3>
                            <ShowChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Artiste le plus écouté: <strong>Artist Name</strong></p>
                            <p>Croissance: <strong>+45%</strong></p>
                            <div className={styles.lineChart}>
                                <div className={styles.lineChartLine}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Performance globale</h3>
                            <InsertChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Score moyen: <strong>8.7/10</strong></p>
                            <p>Taux d'engagement: <strong>64%</strong></p>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItem}>
                                    <span>Likes</span>
                                    <strong>12.5K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Partages</span>
                                    <strong>8.3K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Commentaires</span>
                                    <strong>3.1K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Enregistrements</span>
                                    <strong>7.4K</strong>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default TrendingStats; 