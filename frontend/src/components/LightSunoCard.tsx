import * as React from 'react';
import styles from '../styles/LightSunoCard.module.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Tooltip from '@mui/material/Tooltip';
import { checkVoteStatus } from '../services/suno.services';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/authStore';
import { SunoSong } from '../types/Suno.types';

interface LightSunoCardProps extends SunoSong {
    reduced?: boolean;
}

export default function LightSunoCard(props: LightSunoCardProps): JSX.Element {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [hasVoted, setHasVoted] = React.useState(false);

    React.useEffect(() => {
        const checkUserVoteStatus = async () => {
            if (isAuthenticated && props._id) {
                try {
                    const { hasVoted: userHasVoted } = await checkVoteStatus(props._id);
                    setHasVoted(userHasVoted);
                } catch (error) {
                    console.error("Error checking vote status:", error);
                }
            } else {
                setHasVoted(false);
            }
        };

        checkUserVoteStatus();
    }, [isAuthenticated, props._id]);

    const {
        name,
        author,
        songImage,
        playCount,
        upVoteCount,
        radioPlayCount,
        radioVoteCount,
        audio
    } = props;

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audio) {
            const sunoLink = audio.replace("https://cdn1.suno.ai/", "https://suno.com/song/").replace(".mp3", "");
            window.open(sunoLink, '_blank', 'noopener,noreferrer');
        }
    };

    const formatCount = (count: number | undefined) => {
        if (!count) return "0";
        return count >= 1000 ? Math.floor(count / 1000) + "K" : count;
    };

    return (
        <div className={styles.card}>
            <img
                src={songImage}
                alt={name}
                className={styles.coverImage}
                onClick={handleAvatarClick}
                title="Click to open on Suno"
            />

            <div className={styles.content}>
                <h3 className={styles.title} title={name}>{name}</h3>
                <p className={styles.artist} title={author}>{author}</p>

                {!props.reduced && (
                    <div className={styles.stats}>
                        <Tooltip title="Suno original upvotes">
                            <div className={styles.statItem}>
                                <ThumbUpIcon className={styles.icon} sx={{ color: '#0072ff' }} />
                                <span>{formatCount(upVoteCount)}</span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Suno original plays">
                            <div className={styles.statItem}>
                                <PlayArrowIcon className={styles.icon} sx={{ color: '#00c6ff' }} />
                                <span>{formatCount(playCount)}</span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Radio plays">
                            <div className={styles.statItem}>
                                <MusicNoteIcon className={styles.icon} sx={{ color: '#d05ce3' }} />
                                <span>{formatCount(radioPlayCount)}</span>
                            </div>
                        </Tooltip>

                        <Tooltip title="Radio votes">
                            <div className={styles.statItem}>
                                <span style={{ fontSize: '14px' }}>🔥</span>
                                <span style={{ color: hasVoted ? '#4caf50' : '#ff6b35' }}>
                                    {formatCount(radioVoteCount)}
                                </span>
                            </div>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );
}
