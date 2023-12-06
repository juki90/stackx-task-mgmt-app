import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import type { FC } from 'react';
import type { IFetchError } from '@/types';

export const FetchError: FC<IFetchError> = ({ message, size, center }) => (
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
            marginBottom: center ? `${size * 1.2}px` : 0,
            padding: '0 20px'
        }}
    >
        <CancelOutlinedIcon
            color="error"
            sx={{ fontSize: size * 1.5, marginBottom: '10px' }}
        />
        <Typography color="error" fontSize={size / 3}>
            {message}
        </Typography>
    </Box>
);

FetchError.propTypes = {
    size: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    center: PropTypes.bool
};
