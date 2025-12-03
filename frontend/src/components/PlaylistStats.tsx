import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

const PlaylistStats: React.FC = () => {
    const [selectedPlaylist, setSelectedPlaylist] = useState('All Playlists');
    const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');

    const handlePlaylistChange = (event: any) => {
        setSelectedPlaylist(event.target.value);
    };

    const handleTimeframeChange = (event: any) => {
        setSelectedTimeframe(event.target.value);
    };

    // Options pour les dropdowns
    const playlistOptions = ['All Playlists', 'Top Hits 2023', 'Chill Vibes', 'Electronic Focus', 'Workout Mix'];
    const timeframeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year', 'All Time'];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.statsContainer}>
                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Tendances d'engagement</h3>
                            <ShowChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Écoutes totales: <strong>184,352</strong></p>
                            <p>Progression: <strong>+18.7% depuis le mois dernier</strong></p>
                            <div className={styles.lineChart}>
                                <div className={styles.lineChartLine}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Playlists par genre</h3>
                            <PieChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Genre le plus populaire: <strong>Pop (28%)</strong></p>
                            <p>Second genre: <strong>Électronique (22%)</strong></p>
                            <div className={styles.pieChart}>
                                <div className={styles.pieSegment1}></div>
                                <div className={styles.pieSegment2}></div>
                                <div className={styles.pieSegment3}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Longueur des playlists</h3>
                            <BarChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Moyenne de titres: <strong>18 titres</strong></p>
                            <p>Durée moyenne: <strong>65 minutes</strong></p>
                            <div className={styles.barChart}>
                                <div className={styles.barChartBar} style={{ width: '30%' }}>1-5 titres</div>
                                <div className={styles.barChartBar} style={{ width: '45%' }}>6-10 titres</div>
                                <div className={styles.barChartBar} style={{ width: '80%' }}>11-20 titres</div>
                                <div className={styles.barChartBar} style={{ width: '60%' }}>21-30 titres</div>
                                <div className={styles.barChartBar} style={{ width: '35%' }}>31+ titres</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>User Behavior</h3>
                            <DonutLargeIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Completion Rate: <strong>73%</strong></p>
                            <p>Share Rate: <strong>18%</strong></p>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItem}>
                                    <span>Likes</span>
                                    <strong>85.2K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Followers</span>
                                    <strong>62.7K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Shares</span>
                                    <strong>14.3K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Adds</span>
                                    <strong>28.9K</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>Playlist Statistics</span>
                </div>
                <div className={styles.filterContainer}>
                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedPlaylist}
                            onChange={handlePlaylistChange}
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
                            {playlistOptions.map(option => (
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

                <div className={styles.playlistMetrics}>
                    <div className={styles.metricItem}>
                        <QueueMusicIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>Total Playlists</span>
                            <span className={styles.metricValue}>5,247</span>
                        </div>
                    </div>
                    <div className={styles.metricItem}>
                        <QueueMusicIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>Avg. Duration</span>
                            <span className={styles.metricValue}>65 mins</span>
                        </div>
                    </div>
                    <div className={styles.metricItem}>
                        <QueueMusicIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>Avg. Tracks</span>
                            <span className={styles.metricValue}>18</span>
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

export default PlaylistStats; 