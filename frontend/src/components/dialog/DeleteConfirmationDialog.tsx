import React from 'react';
import { Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
}) => {
    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: 400,
                    backgroundColor: '#121212',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px 24px',
                        backgroundColor: '#121212',
                    }}
                >
                    <Typography variant="h6" style={{ color: 'white', fontWeight: 500 }}>
                        Confirmer la suppression
                    </Typography>
                </div>
                <div
                    style={{
                        padding: '16px 24px',
                        backgroundColor: '#121212',
                    }}
                >
                    <Typography style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Êtes-vous sûr de vouloir supprimer "<span style={{ fontWeight: 600 }}>{title}</span>" ? Cette action est irréversible.
                    </Typography>
                </div>
                <div
                    style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        backgroundColor: '#121212',
                    }}
                >
                    <Button
                        onClick={onClose}
                        style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={onConfirm}
                        startIcon={<DeleteIcon />}
                        style={{
                            color: '#f44336',
                            fontWeight: 500,
                        }}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationDialog; 