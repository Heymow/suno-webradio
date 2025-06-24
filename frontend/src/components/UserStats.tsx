import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const UserStats: React.FC = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');
    const [selectedMetric, setSelectedMetric] = useState('Growth');

    const handleTimeframeChange = (event: any) => {
        setSelectedTimeframe(event.target.value);
    };

    const handleMetricChange = (event: any) => {
        setSelectedMetric(event.target.value);
    };

    // Options pour les dropdowns
    const timeframeOptions = ['This Week', 'This Month', 'This Quarter', 'This Year', 'All Time'];
    const metricOptions = ['Growth', 'Engagement', 'Retention', 'Conversion'];

    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.statsContainer}>
                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Croissance des utilisateurs</h3>
                            <ShowChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Nouveaux utilisateurs: <strong>+1,247</strong></p>
                            <p>Croissance mensuelle: <strong>+8.5%</strong></p>
                            <div className={styles.lineChart}>
                                <div className={styles.lineChartLine}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Distribution démographique</h3>
                            <PieChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Groupe d'âge principal: <strong>18-24 ans (42%)</strong></p>
                            <p>Répartition par genre: <strong>52% femmes, 48% hommes</strong></p>
                            <div className={styles.pieChart}>
                                <div className={styles.pieSegment1}></div>
                                <div className={styles.pieSegment2}></div>
                                <div className={styles.pieSegment3}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Activité par région</h3>
                            <BarChartIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Région la plus active: <strong>Europe (41%)</strong></p>
                            <p>Région en croissance: <strong>Asie (+15.3%)</strong></p>
                            <div className={styles.barChart}>
                                <div className={styles.barChartBar} style={{ width: '85%' }}>Europe</div>
                                <div className={styles.barChartBar} style={{ width: '70%' }}>Amérique du Nord</div>
                                <div className={styles.barChartBar} style={{ width: '60%' }}>Asie</div>
                                <div className={styles.barChartBar} style={{ width: '40%' }}>Amérique du Sud</div>
                                <div className={styles.barChartBar} style={{ width: '25%' }}>Afrique</div>
                                <div className={styles.barChartBar} style={{ width: '20%' }}>Océanie</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsCard}>
                        <div className={styles.statsHeader}>
                            <h3>Comportement des utilisateurs</h3>
                            <GroupIcon fontSize="medium" />
                        </div>
                        <div className={styles.statsContent}>
                            <p>Taux de rétention: <strong>68%</strong></p>
                            <p>Sessions moyennes: <strong>4.2 par semaine</strong></p>
                            <div className={styles.dataGrid}>
                                <div className={styles.dataItem}>
                                    <span>Écoutes</span>
                                    <strong>12.3 M</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Playlists</span>
                                    <strong>285K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Partages</span>
                                    <strong>423K</strong>
                                </div>
                                <div className={styles.dataItem}>
                                    <span>Likes</span>
                                    <strong>1.8 M</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightSidebar}>
                <div className={styles.filterHeader}>
                    <span>User Statistics</span>
                </div>
                <div className={styles.filterContainer}>
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

                    <StyledFormControl variant="outlined" size="small">
                        <Select
                            value={selectedMetric}
                            onChange={handleMetricChange}
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
                            {metricOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                </div>

                <div className={styles.userMetrics}>
                    <div className={styles.metricItem}>
                        <PersonIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>Total Users</span>
                            <span className={styles.metricValue}>124,758</span>
                        </div>
                    </div>
                    <div className={styles.metricItem}>
                        <PersonIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>Active Users</span>
                            <span className={styles.metricValue}>87,124</span>
                        </div>
                    </div>
                    <div className={styles.metricItem}>
                        <PersonIcon fontSize="small" />
                        <div className={styles.metricInfo}>
                            <span className={styles.metricLabel}>New Users</span>
                            <span className={styles.metricValue}>+1,247</span>
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

export default UserStats; 