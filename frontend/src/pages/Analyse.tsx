import React, { useState } from 'react';
import styles from '../styles/Analyse.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingInsight from '../components/AnalyzeComponents/TrendingInsight';
import TrendingStats from '../components/AnalyzeComponents/TrendingStats';
import TrendingTags from '../components/AnalyzeComponents/TrendingTags';
import SongInsight from '../components/AnalyzeComponents/SongInsight';
import SongStats from '../components/AnalyzeComponents/SongStats';
import SongTags from '../components/AnalyzeComponents/SongTags';
import UserInsight from '../components/AnalyzeComponents/UserInsight';
import UserStats from '../components/AnalyzeComponents/UserStats';
import UserTags from '../components/AnalyzeComponents/UserTags';
import PlaylistInsight from '../components/AnalyzeComponents/PlaylistInsight';
import PlaylistStats from '../components/AnalyzeComponents/PlaylistStats';
import PlaylistTags from '../components/AnalyzeComponents/PlaylistTags';

interface AnalyseProps {
    onBack: () => void;
}

const Analyse: React.FC<AnalyseProps> = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState('insight');
    const [activeTab, setActiveTab] = useState('trending');

    const handleSectionChange = (section: string) => {
        setActiveSection(section);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Déterminer quel composant afficher en fonction des onglets actifs
    const renderContent = () => {
        if (activeTab === 'trending') {
            if (activeSection === 'insight') {
                return <TrendingInsight />;
            } else if (activeSection === 'stats') {
                return <TrendingStats />;
            } else if (activeSection === 'tags') {
                return <TrendingTags />;
            }
        } else if (activeTab === 'songs') {
            if (activeSection === 'insight') {
                return <SongInsight />;
            } else if (activeSection === 'stats') {
                return <SongStats />;
            } else if (activeSection === 'tags') {
                return <SongTags />;
            }
        } else if (activeTab === 'users') {
            if (activeSection === 'insight') {
                return <UserInsight />;
            } else if (activeSection === 'stats') {
                return <UserStats />;
            } else if (activeSection === 'tags') {
                return <UserTags />;
            }
        } else if (activeTab === 'playlists') {
            if (activeSection === 'insight') {
                return <PlaylistInsight />;
            } else if (activeSection === 'stats') {
                return <PlaylistStats />;
            } else if (activeSection === 'tags') {
                return <PlaylistTags />;
            }
        }
        return <div className={styles.placeholderContent}>Contenu en développement pour {activeTab} - {activeSection}</div>;
    };

    return (
        <div className={styles.analyseContainer}>
            <div className={styles.toolbar}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowBackIcon fontSize="small" />
                    Back to Radio
                </button>
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'trending' ? styles.active : ''}`}
                        onClick={() => handleTabChange('trending')}
                    >
                        Trending
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'songs' ? styles.active : ''}`}
                        onClick={() => handleTabChange('songs')}
                    >
                        Songs
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'playlists' ? styles.active : ''}`}
                        onClick={() => handleTabChange('playlists')}
                    >
                        Playlists
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftSidebar}>
                    <div
                        className={`${styles.sidebarItem} ${activeSection === 'insight' ? styles.active : ''}`}
                        onClick={() => handleSectionChange('insight')}
                    >
                        <div className={styles.iconContainer}>
                            <VisibilityIcon fontSize="small" />
                        </div>
                        <span className={styles.sidebarText}>Insight</span>
                    </div>
                    <div
                        className={`${styles.sidebarItem} ${activeSection === 'stats' ? styles.active : ''}`}
                        onClick={() => handleSectionChange('stats')}
                    >
                        <div className={styles.iconContainer}>
                            <QueryStatsIcon fontSize="small" />
                        </div>
                        <span className={styles.sidebarText}>Stats</span>
                    </div>
                    <div
                        className={`${styles.sidebarItem} ${activeSection === 'tags' ? styles.active : ''}`}
                        onClick={() => handleSectionChange('tags')}
                    >
                        <div className={styles.iconContainer}>
                            <LocalOfferIcon fontSize="small" />
                        </div>
                        <span className={styles.sidebarText}>Tags</span>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Analyse;
