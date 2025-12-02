import * as React from 'react';
import styles from './styles/SunoProjectCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Tooltip from '@mui/material/Tooltip';
import { checkVoteStatus } from './services/suno.services';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated } from './store/authStore';

export default function RecipeReviewCard(props: SunoSong): JSX.Element {
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
        name: titleText,
        author: subheaderText,
        prompt,
        negative: negativePrompt,
        avatarImage,
        playCount,
        upVoteCount,
        modelVersion,
        audio
    } = props;



    const handleAvatarClick = () => {
        if (audio) {
            const sunoLink = audio.replace("https://cdn1.suno.ai/", "https://suno.com/song/").replace(".mp3", "");
            window.open(sunoLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Box sx={{
            // display: 'flex',
            // alignItems: 'flex-start',
            // marginInline: 'auto',
            // backgroundColor: 'rgba(255, 255, 255, 0.8)',
            // borderRadius: '5px',
            // maxHeight: '60vh',
            // marginTop: '4vh',

        }}>
            <Card sx={{ maxWidth: 200, maxHeight: '10vh', minWidth: '15vw', borderRadius: '5px' }}>
                <CardHeader
                    className={styles.cardHeader}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', position: 'relative', zIndex: 2, padding: '5px' }}
                    avatar={
                        <Avatar sx={{
                            bgcolor: red[500],
                            marginLeft: "7px",
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.1)'
                            }
                        }}
                            aria-label="avatar"
                            src={props.songImage}
                            onClick={handleAvatarClick}
                            title="Cliquer pour ouvrir sur Suno">
                        </Avatar>
                    }
                    title={<Typography className={styles.headerCard} variant="h6" fontSize='100%' fontWeight={600} component="div">
                        {subheaderText}
                    </Typography>}
                    subheader={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Typography className={styles.lightHeaderCard} fontSize='80%' component="div">
                                {titleText.length > 30 ?
                                    titleText.slice(0, 30) + "..." : titleText}
                            </Typography>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <Tooltip title="Suno original upvotes">
                                    <Chip sx={{
                                        height: '22px',
                                        fontSize: '12px',
                                        cursor: 'default',
                                        backgroundColor: '#2196f3',
                                        color: 'white'
                                    }} label={
                                        (props.upVoteCount || 0) >= 1000 ?
                                            <span className={styles.fragment}>
                                                <ThumbUpIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "5px", fontSize: '12px' }} />
                                                {Math.floor((props.upVoteCount || 0) / 1000) + "K"}
                                            </span> :
                                            <span className={styles.fragment}>
                                                <ThumbUpIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "5px", fontSize: '12px' }} />
                                                {props.upVoteCount || 0}
                                            </span>
                                    }>
                                    </Chip>
                                </Tooltip>
                                <Tooltip title="Suno original plays">
                                    <Chip sx={{
                                        height: '22px',
                                        fontSize: '12px',
                                        cursor: 'default',
                                        backgroundColor: '#00bcd4',
                                        color: 'white'
                                    }} label={
                                        (props.playCount || 0) >= 1000 ?
                                            <span className={styles.fragment}>
                                                <PlayArrowIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "3px", fontSize: '14px' }} />
                                                {Math.floor((props.playCount || 0) / 1000) + "K"}
                                            </span> :
                                            <span className={styles.fragment}>
                                                <PlayArrowIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "3px", fontSize: '14px' }} />
                                                {props.playCount || 0}
                                            </span>
                                    }>
                                    </Chip>
                                </Tooltip>
                                <Tooltip title="Radio plays">
                                    <Chip sx={{
                                        height: '22px',
                                        backgroundColor: '#9c27b0',
                                        color: 'white',
                                        fontSize: '12px',
                                        cursor: 'default'
                                    }} label={
                                        (props.radioPlayCount || 0) >= 1000 ?
                                            <span className={styles.fragment}>
                                                <MusicNoteIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "3px", fontSize: '14px', color: '#ffeb3b' }} />
                                                {Math.floor((props.radioPlayCount || 0) / 1000) + "K"}
                                            </span> :
                                            <span className={styles.fragment}>
                                                <MusicNoteIcon fontSize='small' sx={{ marginTop: "-1px", marginRight: "3px", fontSize: '14px', color: '#ffeb3b' }} />
                                                {props.radioPlayCount || 0}
                                            </span>
                                    }>
                                    </Chip>
                                </Tooltip>
                                <Tooltip title="Radio votes">
                                    <Chip sx={{
                                        height: '22px',
                                        backgroundColor: hasVoted ? '#4caf50' : '#ff6b35',
                                        color: 'white',
                                        fontSize: '10px',
                                        cursor: 'default'
                                    }} label={
                                        (props.radioVoteCount || 0) >= 1000 ?
                                            <span className={styles.fragment} style={{ fontSize: '12px' }}>
                                                🔥 {Math.floor((props.radioVoteCount || 0) / 1000) + "K"}
                                            </span> :
                                            <span className={styles.fragment} style={{ fontSize: '12px' }}>
                                                🔥 {props.radioVoteCount || 0}
                                            </span>
                                    }>
                                    </Chip>
                                </Tooltip>
                            </div>
                        </div>
                    }


                />
                {/* <CardContent sx={{ backgroundColor: 'rgba(240, 230, 240, 0.7)', position: 'relative', zIndex: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} style={{ "display": "flex", "flexDirection": "column" }}>
                        Style of Music : {prompt}
                        {negativePrompt && <p style={{ "paddingTop": "5px" }}>Exclude Styles : {negativePrompt}</p >}
                        <Chip label={props.modelVersion} size="small" sx={{ width: "auto", maxWidth: "fit-content", marginTop: "15px" }}></Chip>

                    </Typography>
                </CardContent> */}
            </Card>

        </Box>
    );
}
