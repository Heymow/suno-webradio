import React from 'react';
import AudioPlayer from '../components/AudioPlayer';
import { useRadioStream } from '../hooks/useRadioStream';
import styles from '../styles/EmbedPage.module.css';

const EmbedPage: React.FC = () => {
    const { currentTrack } = useRadioStream();

    const handleGlobalClick = (e: React.MouseEvent) => {
        // Prevent toggling if clicking on the logo link or buttons
        if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
            return;
        }

        const audioElement = document.querySelector("audio");
        if (audioElement) {
            if (audioElement.paused) {
                audioElement.play().catch(console.error);
            } else {
                audioElement.pause();
            }
        }
    };

    return (
        <div className={styles.embedContainer} onClick={handleGlobalClick}>
            {currentTrack && (
                <div
                    className={styles.backgroundImage}
                    style={{ backgroundImage: `url(${currentTrack.songImage})` }}
                />
            )}
            <div className={styles.overlay} />

            <div className={styles.contentWrapper}>
                {currentTrack ? (
                    <div className={styles.trackInfoContainer}>
                        <div className={styles.artWrapper}>
                            <img
                                src={currentTrack.songImage}
                                alt={currentTrack.name}
                                className={styles.albumArt}
                            />
                            <div className={styles.playerOverlay}>
                                <AudioPlayer currentTrack={currentTrack} isEmbed={true} />
                            </div>
                        </div>
                        <div className={styles.textInfo}>
                            <h2 className={styles.songTitle}>{currentTrack.name}</h2>
                            <p className={styles.songArtist}>{currentTrack.author}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.loadingInfo}>
                        <div className={styles.loadingArt} />
                        <div className={styles.textInfo}>
                            <h2 className={styles.songTitle}>Pulsify Radio</h2>
                            <p className={styles.songArtist}>Loading...</p>
                        </div>
                    </div>
                )}
            </div>

            <a href={import.meta.env.VITE_SITE_URL || '/'} target="_blank" rel="noopener noreferrer" className={styles.logo}>
                <img src="/logo.png" alt="Pulsify" className={styles.logoImg} onError={(e) => e.currentTarget.style.display = 'none'} />
                <span>Pulsify Radio</span>
            </a>
        </div>
    );
};

export default EmbedPage;
