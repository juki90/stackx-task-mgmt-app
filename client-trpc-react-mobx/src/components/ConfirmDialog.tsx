import PropTypes from 'prop-types';
import { Box, Modal, Button, Typography } from '@mui/material';

import type { FC } from 'react';
import type { IConfirmDialog } from '@/types';

export const ConfirmDialog: FC<IConfirmDialog> = ({
    title,
    description,
    isDialogOpen,
    errorMessage,
    handleConfirm,
    handleCloseDialog
}) => (
    <Modal
        open={!!isDialogOpen}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <Box
            sx={{
                maxWidth: '600px',
                margin: '15px',
                padding: '35px',
                backgroundColor: '#eee',
                borderRadius: '4px'
            }}
        >
            <Typography
                component="h3"
                variant="h5"
                sx={{ marginBottom: '20px' }}
            >
                {title}
            </Typography>
            <Typography
                component="p"
                variant="body1"
                sx={{ marginBottom: '20px' }}
            >
                {description}
            </Typography>
            <Box sx={{ display: 'flex', marginBottom: '20px' }}>
                <Button
                    disabled={!!errorMessage}
                    color={errorMessage ? 'error' : 'primary'}
                    sx={{ marginRight: '20px' }}
                    variant="contained"
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
                <Button variant="outlined" onClick={handleCloseDialog}>
                    Cancel
                </Button>
            </Box>
            {errorMessage ? (
                <Typography sx={{ color: 'red', marginBottom: '15px' }}>
                    {errorMessage}
                </Typography>
            ) : null}
        </Box>
    </Modal>
);

ConfirmDialog.propTypes = {
    title: PropTypes.string.isRequired,
    isDialogOpen: PropTypes.bool.isRequired,
    description: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
    handleCloseDialog: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired
};
