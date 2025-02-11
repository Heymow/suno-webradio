import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { submitSunoLink } from '../services/sunoServices';
import { useSnackbar } from 'notistack';

const SunoCard: React.FC<SunoCardProps> = ({ song, sunoLink }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleAddClick = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await submitSunoLink(sunoLink);
            enqueueSnackbar('Musique ajoutée avec succès !', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Erreur lors de l\'ajout de la musique', {
                variant: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card sx={{ display: 'flex', mb: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        {song.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        {song.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Durée: {song.duration}
                    </Typography>
                </CardContent>
            </Box>
            <Box sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)'
            }}>
                <IconButton
                    aria-label="add"
                    onClick={handleAddClick}
                    disabled={isSubmitting}
                >
                    <AddIcon />
                </IconButton>
            </Box>
        </Card>
    );
};

export default SunoCard; 