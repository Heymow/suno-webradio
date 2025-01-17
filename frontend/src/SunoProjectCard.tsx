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
// Custom hook for typing effect
const useTypingEffect = (fullText: string, speed = 10) => {
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


    React.useEffect(() => {
        setImageClass(styles.imageHidden);
        const timer = setTimeout(() => {
            setCurrentImage(props.songImage);
            setImageClass(styles.imageVisible);
        }, 1200); // Délai pour s'assurer que l'image est chargée avant de commencer la transition
        return () => clearTimeout(timer);
    }, [props.songImage]);

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            marginInline: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            maxHeight: '60vh',
            marginTop: '1vh',
        }}>
            <Card sx={{ maxWidth: 345, maxHeight: '60vh', minWidth: '30vw' }}>
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
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', position: 'relative', zIndex: 2 }}
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }} aria-label="avatar" src={props.avatarImage}>
                        </Avatar>

                    }
                    title={<Typography className={styles.headerCard} variant="h6">{titleText}
                        <Chip sx={{ height: '25px' }} label={props.playCount >= 1000
                            ? <div className={styles.fragment}> <PlayArrowIcon fontSize='small' /> {Math.floor(props.playCount / 1000) + "K"} </div> :
                            <div className={styles.fragment}><PlayArrowIcon fontSize='small' /> {props.playCount}</div>}>
                        </Chip>
                    </Typography>}

                    subheader={<Typography className={styles.headerCard} variant="subtitle2">{subheaderText}
                        <Chip sx={{ height: '25px', marginLeft: "0px" }} label={props.upVoteCount >= 1000 ?
                            <div className={styles.fragment}> <ThumbUpIcon fontSize='small' sx={{ marginRight: "5px" }} /> {Math.floor(props.upVoteCount / 1000) + "K"} </div> :
                            <div className={styles.fragment}> <ThumbUpIcon fontSize='small' sx={{ marginRight: "5px" }} /> {props.upVoteCount}</div>}>
                        </Chip>
                    </Typography>}

                />
                <CardContent sx={{ backgroundColor: 'rgba(240, 230, 240, 0.7)', position: 'relative', zIndex: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} style={{ "display": "flex", "flexDirection": "column", }}>
                        Style of Music : {prompt}
                        {negativePrompt && <p style={{ "paddingTop": "5px" }}>Exclude Styles : {negativePrompt}</p >}
                        <Chip label={props.modelVersion} size="small" sx={{ width: "100%", maxWidth: "fit-content", marginTop: "15px", }}></Chip>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><button className={styles.likeButton}>Vote</button></div>

                    </Typography>


                </CardContent>


            </Card>


            <div style={{ zIndex: 1, marginTop: '-20px' }}>

                {props.lyrics ? <div style={{ "marginLeft": "30px" }}>Lyrics</div> : null}
                {props.lyrics && <CardContent
                    sx={{
                        maxWidth: 400,
                        maxHeight: '60vh',
                        marginLeft: 2,
                        height: 450,
                        overflowY: 'auto',
                        padding: 2,
                        boxSizing: 'border-box',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '4px',
                    }}
                >
                    {typedLyrics?.split('\n').map((line, index) => (
                        <Typography variant="body2" key={index} sx={{ marginBottom: 1, color: 'rgba(0, 0, 0, 0.6)' }}>
                            {line}
                        </Typography>
                    ))}
                </CardContent>}

            </div>

        </Box>
    );
}
