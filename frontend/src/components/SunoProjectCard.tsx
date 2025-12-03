import * as React from 'react';
import styles from '../styles/SunoProjectCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import Box from '@mui/material/Box';
import { SunoSong } from '../types/Suno.types';
import Chip from '@mui/material/Chip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Tooltip from '@mui/material/Tooltip';
import { voteSong, unvoteSong, checkVoteStatus } from '../services/suno.services';
import { useSnackbar } from 'notistack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated, selectIsActivated, decrementLikesRemaining, incrementLikesRemaining } from '../store/authStore';

// Custom hook for typing effect
const useTypingEffect = (fullText: string | undefined, speed = 10) => {
    const [displayedText, setDisplayedText] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!fullText) return;
        let index = 0;

        const timer = setInterval(() => {
            setDisplayedText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [fullText, speed]);

    return displayedText;
};

export default function SunoProjectCard(props: SunoSong): JSX.Element {
    const { enqueueSnackbar } = useSnackbar();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isActivated = useAppSelector(selectIsActivated);
    const dispatch = useAppDispatch();

    // Example texts with typing effect
    const titleText = useTypingEffect(props.name, 70);
    const subheaderText = useTypingEffect(props.author, 70);
    const prompt = useTypingEffect(props.prompt, 30);
    const negativePrompt = useTypingEffect(props.negative, 30);

    // Utiliser le hook pour l'ensemble des paroles comme une seule chaîne
    const lyricsText = props.lyrics || "________________ Instrumental ________________";
    const typedLyrics = useTypingEffect(lyricsText, 1);

    const [imageClass, setImageClass] = React.useState(styles.imageHidden);
    const [currentImage, setCurrentImage] = React.useState(props.songImage);
    const [isVoting, setIsVoting] = React.useState(false);
    const [localVoteCount, setLocalVoteCount] = React.useState(props.radioVoteCount || 0);
    const [hasVoted, setHasVoted] = React.useState(false);

    const handleAvatarClick = () => {
        if (props.audio) {
            console.log(props)
            const sunoLink = props.audio.replace("https://cdn1.suno.ai/", "https://suno.com/song/").replace(".mp3", "");
            window.open(sunoLink, '_blank', 'noopener,noreferrer');
        }
    };

    const handleVote = async () => {
        if (!isAuthenticated) {
            enqueueSnackbar("Please log in to vote for songs", { variant: "warning" });
            return;
        }

        if (!isActivated) {
            enqueueSnackbar("Please activate your account to vote for songs", { variant: "warning" });
            return;
        }

        try {
            setIsVoting(true);

            if (hasVoted) {
                // Retirer le vote
                const response = await unvoteSong(props._id);
                setLocalVoteCount(response.song.radioVoteCount);
                setHasVoted(false);
                dispatch(incrementLikesRemaining());
                enqueueSnackbar(`Vote removed! ${response.likesRemainingToday} votes remaining today.`, { variant: "info" });
            } else {
                // Ajouter le vote
                const response = await voteSong(props._id);
                setLocalVoteCount(response.song.radioVoteCount);
                setHasVoted(true);
                dispatch(decrementLikesRemaining());
                enqueueSnackbar(`Vote submitted successfully! ${response.likesRemainingToday} votes remaining today.`, { variant: "success" });
            }

            // Re-vérifier le statut après l'action pour s'assurer de la cohérence
            try {
                const { hasVoted: newVoteStatus } = await checkVoteStatus(props._id);
                setHasVoted(newVoteStatus);
            } catch (error) {
                console.error("Error re-checking vote status:", error);
            }
        } catch (error: any) {
            if (error?.response?.data?.message) {
                enqueueSnackbar(error.response.data.message, { variant: "error" });
            } else {
                enqueueSnackbar("Failed to submit vote. Please try again.", { variant: "error" });
            }
        } finally {
            setIsVoting(false);
        }
    };

    React.useEffect(() => {
        setImageClass(styles.imageHidden);
        const timer = setTimeout(() => {
            setCurrentImage(props.songImage);
            setImageClass(styles.imageVisible);
        }, 1200); // Délai pour s'assurer que l'image est chargée avant de commencer la transition
        return () => clearTimeout(timer);
    }, [props.songImage]);

    React.useEffect(() => {
        setLocalVoteCount(props.radioVoteCount || 0);
    }, [props.radioVoteCount]);



    // Vérifier le statut du vote au chargement et quand la chanson change
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

        // Réinitialiser le statut de vote quand la chanson change
        return () => {
            setHasVoted(false);
        };
    }, [isAuthenticated, props._id]);

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            marginInline: 'auto',
            backgroundColor: 'transparent',
            borderRadius: '4px',
            maxHeight: '60vh',
            marginTop: '1vh',
        }}>
            <Card sx={{ maxWidth: 345, maxHeight: '60vh', minWidth: '30vw', backgroundColor: 'transparent', boxShadow: 'none' }}>
                <CardMedia
                    component="img"
                    height="194"
                    image={currentImage}
                    alt="Suno song image"
                    className={imageClass}
                    sx={{ position: 'absolute', top: '5vh', left: 0, width: '100%', height: '82vh', objectPosition: 'center 40%', zIndex: 1 }}
                />
                <CardHeader
                    className={styles.cardHeader}
                    sx={{
                        backgroundColor: 'rgba(30, 30, 40, 0.6)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        zIndex: 2,
                        color: 'white',
                        '& .MuiCardHeader-subheader': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                    avatar={
                        <Avatar
                            sx={{
                                bgcolor: red[500],
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                            aria-label="avatar"
                            src={props.songImage}
                            onClick={handleAvatarClick}
                            title="Click to open on Suno">
                        </Avatar>

                    }
                    title={<Typography className={styles.headerCard} variant="h6">{titleText}
                        <Tooltip title="Suno original plays">
                            <Chip sx={{
                                height: '25px',
                                cursor: 'default',
                                backgroundColor: '#00bcd4',
                                color: 'white'
                            }} label={props.playCount >= 1000
                                ? <div className={styles.fragment}> <PlayArrowIcon fontSize='small' sx={{ marginTop: "-2px", marginLeft: "-5px", marginRight: "5px", fontSize: '22px' }} /> {Math.floor(props.playCount / 1000) + "K"} </div> :
                                <div className={styles.fragment}><PlayArrowIcon fontSize='small' sx={{ marginTop: "-2px", marginRight: "5px", fontSize: '22px' }} /> {props.playCount}</div>}>
                            </Chip>
                        </Tooltip>
                    </Typography>}

                    subheader={<Typography className={styles.headerCard} variant="subtitle2">{subheaderText}
                        <Tooltip title="Suno original upvotes">
                            <Chip sx={{
                                height: '25px',
                                marginLeft: "0px",
                                cursor: 'default',
                                backgroundColor: '#2196f3',
                                color: 'white'
                            }} label={
                                (props.upVoteCount || 0) >= 1000 ?
                                    <div className={styles.fragment}>
                                        <ThumbUpIcon fontSize='small' sx={{ marginTop: "-2px", marginRight: "5px", fontSize: '13px' }} />
                                        {Math.floor((props.upVoteCount || 0) / 1000) + "K"}
                                    </div> :
                                    <div className={styles.fragment}>
                                        <ThumbUpIcon fontSize='small' sx={{ marginTop: "-2px", marginRight: "5px", fontSize: '13px' }} />
                                        {props.upVoteCount || 0}
                                    </div>
                            }>
                            </Chip>
                        </Tooltip>
                    </Typography>}

                />
                <CardContent sx={{ backgroundColor: 'rgba(30, 30, 40, 0.6)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 2 }}>
                    <Box sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column' }}>
                        Style of Music : {prompt}
                        {negativePrompt && <Typography sx={{ paddingTop: '5px' }}>Exclude Styles : {negativePrompt}</Typography>}
                        <Tooltip title="Suno AI model version">
                            <Chip label={props.modelVersion} size="small" sx={{ width: "100%", maxWidth: "fit-content", marginTop: "15px", fontSize: "12px", cursor: 'default', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }} />
                        </Tooltip>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <button
                                className={`${styles.likeButton} ${hasVoted ? styles.likeButtonVoted : ''}`}
                                onClick={handleVote}
                                disabled={isVoting || !isAuthenticated || !isActivated}
                                title={hasVoted ? "Click to remove your vote" : "Click to vote for this song"}
                            >
                                <ThumbUpIcon
                                    fontSize="small"
                                    sx={{ marginRight: "8px", fontSize: "13px" }}
                                />
                                {isVoting ? "Voting..." : hasVoted ? "Remove Vote" : "Vote"}
                            </button>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Tooltip title="Radio plays">
                                    <Chip
                                        sx={{
                                            height: '24px',
                                            backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                            border: '1px solid rgba(156, 39, 176, 0.3)',
                                            color: '#e0e0e0',
                                            fontSize: '11px',
                                            cursor: 'default'
                                        }}
                                        label={
                                            (props.radioPlayCount || 0) >= 1000 ?
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <MusicNoteIcon fontSize='small' sx={{ fontSize: '14px', color: '#d05ce3' }} />
                                                    <span style={{ marginLeft: "4px", fontSize: '14px' }}>
                                                        {Math.floor((props.radioPlayCount || 0) / 1000) + "K"}
                                                    </span>
                                                </div> :
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <MusicNoteIcon fontSize='small' sx={{ fontSize: '14px', color: '#d05ce3' }} />
                                                    <span style={{ marginLeft: "4px", fontSize: '14px' }}>
                                                        {props.radioPlayCount || 0}
                                                    </span>
                                                </div>
                                        }>
                                    </Chip>
                                </Tooltip>
                                <Tooltip title="Radio votes">
                                    <Chip
                                        sx={{
                                            height: '24px',
                                            backgroundColor: hasVoted ? 'rgba(0, 198, 255, 0.2)' : 'rgba(255, 107, 53, 0.2)',
                                            border: hasVoted ? '1px solid rgba(0, 198, 255, 0.3)' : '1px solid rgba(255, 107, 53, 0.3)',
                                            color: '#e0e0e0',
                                            fontWeight: 'bold',
                                            fontSize: '13px',
                                            cursor: 'default'
                                        }}
                                        label={localVoteCount >= 1000 ?
                                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                                                🔥
                                                <span style={{ marginLeft: "4px" }}>
                                                    {Math.floor(localVoteCount / 1000) + "K"}
                                                </span>
                                            </div> :
                                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                                                🔥
                                                <span style={{ marginLeft: "4px" }}>
                                                    {localVoteCount}
                                                </span>
                                            </div>
                                        }>
                                    </Chip>
                                </Tooltip>
                            </div>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <div style={{ zIndex: 1, marginTop: '-20px' }}>
                {props.lyrics && (
                    <>
                        <div className={styles.lyricsLabel}>Lyrics</div>
                        <div className={styles.lyricsFolder}>
                            {typedLyrics?.split('\n').map((line, index) => (
                                <Typography variant="body2" key={index} sx={{ marginBottom: 1, color: 'rgba(0, 0, 0, 0.6)' }}>
                                    {line}
                                </Typography>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Box>
    );
}
