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

export default function RecipeReviewCard(props: SunoSong): JSX.Element {
    const {
        name: titleText,
        author: subheaderText,
        prompt,
        negative: negativePrompt,
        avatarImage,
        playCount,
        upVoteCount,
        modelVersion
    } = props;


    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            marginInline: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '5px',
            maxHeight: '60vh',
            marginTop: '4vh',

        }}>
            <Card sx={{ maxWidth: 345, maxHeight: '60vh', minWidth: '15vw', borderRadius: '5px', }}>
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
                        <Chip sx={{ height: '20px', marginLeft: "0px" }} label={props.upVoteCount >= 1000 ?
                            <div className={styles.fragment}> <ThumbUpIcon fontSize='small' sx={{ marginRight: "5px", fontSize: '14px' }} /> {Math.floor(props.upVoteCount / 1000) + "K"} </div> :
                            <div className={styles.fragment}> <ThumbUpIcon fontSize='small' sx={{ marginRight: "5px", fontSize: '14px' }} /> {props.upVoteCount}</div>}>
                        </Chip>
                    </Typography>}

                />
                <CardContent sx={{ backgroundColor: 'rgba(240, 230, 240, 0.7)', position: 'relative', zIndex: 2 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexDirection: 'column' }}>
                        Style of Music : {prompt}
                        {negativePrompt && <Typography sx={{ paddingTop: '5px' }}>Exclude Styles : {negativePrompt}</Typography>}
                        <Chip label={modelVersion} size="small" sx={{ width: "auto", maxWidth: "fit-content", marginTop: "15px" }} />
                    </Box>
                </CardContent>
            </Card>

        </Box>
    );
}
