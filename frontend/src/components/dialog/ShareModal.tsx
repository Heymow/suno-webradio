import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button, Tooltip, TextField, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import TelegramIcon from '@mui/icons-material/Telegram';
import CodeIcon from '@mui/icons-material/Code';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/authStore';

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    onOpenLogin: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, onOpenLogin }) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [showEmbed, setShowEmbed] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const currentUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    const handleCopyLink = (platform?: string) => {
        navigator.clipboard.writeText(currentUrl);
        setSnackbarMessage(platform ? `Link copied for ${platform}!` : 'Link copied to clipboard!');
        setSnackbarOpen(true);
    };

    const shareLinks = [
        { name: 'Copy Link', icon: <ContentCopyIcon />, action: () => handleCopyLink(), color: '#757575' },
        { name: 'Instagram', icon: <InstagramIcon />, action: () => handleCopyLink('Instagram'), color: '#E1306C' },
        { name: 'X (Twitter)', icon: <TwitterIcon />, url: `https://twitter.com/intent/tweet?url=${currentUrl}&text=Check out Pulsify Radio!`, color: '#1DA1F2' },
        { name: 'Facebook', icon: <FacebookIcon />, url: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, color: '#1877F2' },
        { name: 'Telegram', icon: <TelegramIcon />, url: `https://t.me/share/url?url=${currentUrl}&text=Check out Pulsify Radio!`, color: '#0088cc' },
    ];

    // Note: The embed URL logic would need a real route on the frontend to handle the embed view.
    // For now, we assume /embed exists or will exist.
    const embedCode = `<iframe src="${currentUrl}/embed" width="100%" height="150" frameborder="0" allow="autoplay"></iframe>`;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(20, 20, 30, 0.95)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        borderRadius: '15px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '300px',
                        maxWidth: '500px'
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    Share Pulsify Radio
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, pt: '20px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 3, p: 1 }}>
                        {shareLinks.map((link) => (
                            <Tooltip key={link.name} title={link.name}>
                                <IconButton
                                    onClick={() => link.action ? link.action() : window.open(link.url, '_blank')}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: link.color,
                                        width: '50px',
                                        height: '50px',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)', transform: 'scale(1.1)' },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {link.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                        <Tooltip title="Embed Radio">
                            <IconButton
                                onClick={() => setShowEmbed(!showEmbed)}
                                sx={{
                                    backgroundColor: showEmbed ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                    color: '#ff9800',
                                    width: '50px',
                                    height: '50px',
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)', transform: 'scale(1.1)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CodeIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {showEmbed && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', animation: 'fadeIn 0.3s' }}>
                            {isAuthenticated ? (
                                <>
                                    <Typography variant="body2" sx={{ mb: 1, color: '#aaa' }}>
                                        Copy this code to embed the radio on your site:
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        value={embedCode}
                                        InputProps={{
                                            readOnly: true,
                                            style: { color: 'white', fontSize: '0.8rem', fontFamily: 'monospace' }
                                        }}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                                            mb: 2
                                        }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{ bgcolor: '#0072ff', '&:hover': { bgcolor: '#005bb5' } }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(embedCode);
                                            setSnackbarMessage('Embed code copied!');
                                            setSnackbarOpen(true);
                                        }}
                                    >
                                        Copy Code
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                                        You must be logged in to generate an embed code.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#0072ff', color: '#0072ff' } }}
                                        onClick={() => {
                                            onClose();
                                            onOpenLogin();
                                        }}
                                    >
                                        Log In
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ShareModal;
