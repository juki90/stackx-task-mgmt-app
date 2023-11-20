import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

import type { FC } from 'react';
import type { ISuspenseFallback } from '@/types';

export const SuspenseFallback: FC<ISuspenseFallback> = ({
    message,
    size,
    center
}) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            fontSize: '25px',
            color: '#777',
            height: center ? 'calc(100vh - 5em)' : `${size * 1.2}px`,
            width: '100%',
            margin: center ? 0 : '50px 0',
            marginBottom: center ? `${size * 1.2}px` : 0
        }}
    >
        <CircularProgress
            size={size}
            sx={{ color: '#999', marginBottom: '20px' }}
        />
        <Typography fontSize={size / 3}>{message}...</Typography>
    </Box>
);

SuspenseFallback.propTypes = {
    size: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    center: PropTypes.bool
};
