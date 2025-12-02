import React, { useState } from 'react';
import styles from '../../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';

const SongStats: React.FC = () => {
    const [selectedSong, setSelectedSong] = useState('All Songs');
    const [selectedTimeframe, setSelectedTimeframe] = useState('All Time');

    const handleSongChange = (event: any) => {
        setSelectedSong(event.target.value);
    };

    const handleTimeframeChange = (event: any) => {
        setSelectedTimeframe(event.target.value);
    };

    // Options pour les dropdowns
    const songOptions = ['All Songs', 'Summer Haze', 'Midnight Dreams', 'Urban Jungle', 'Echoes of You'];
    const timeframeOptions = ['All Time', 'Last Week', 'Last Month', 'Last Year'];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.statsContainer}>
                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Écoutes par jour</h3>
                            <BarChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Total des écoutes: <strong>85,723</strong></p>
                            <p>Moyenne quotidienne: <strong>2,857</strong></p>
                            <div className={styles.barChart}>
                                <div className={styles.barChartBar} style={{ width: '60%' }}>Lundi</div>
                                <div className={styles.barChartBar} style={{ width: '75%' }}>Mardi</div>
                                <div className={styles.barChartBar} style={{ width: '55%' }}>Mercredi</div>
                                <div className={styles.barChartBar} style={{ width: '80%' }}>Jeudi</div>
                                <div className={styles.barChartBar} style={{ width: '95%' }}>Vendredi</div>
                                <div className={styles.barChartBar} style={{ width: '85%' }}>Samedi</div>
                                <div className={styles.barChartBar} style={{ width: '65%' }}>Dimanche</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Répartition démographique</h3>
                            <PieChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Tranche d'âge principale: <strong>25-34 ans</strong></p>
                            <p>Genre: <strong>58% femmes, 42% hommes</strong></p>
                            <div className={styles.pieChart}>
                                <div className={styles.pieSegment1}></div>
                                <div className={styles.pieSegment2}></div>
                                <div className={styles.pieSegment3}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Tendance des écoutes</h3>
                            <ShowChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Croissance mensuelle: <strong>+12.3%</strong></p>
                            <p>Pic d'écoute: <strong>Vendredis à 20h</strong></p>
                            <div className={styles.lineChart}>
                                <div className={styles.lineChartLine}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Engagement des utilisateurs</h3>
                            <TimelineIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Taux de complétion: <strong>87%</strong></p>
                            <p>Taux de partage: <strong>23%</strong></p>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItem}>
                                    <span>Likes</span>
                                    <strong>15.3K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Partages</span>
                                    <strong>5.2K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Playlists</span>
                                    <strong>8.7K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Commentaires</span>
                                    <strong>3.9K</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>Song Statistics</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedSong}
                            onChange={handleSongChange}
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
                            {songOptions.map(option => (
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

export default SongStats; 