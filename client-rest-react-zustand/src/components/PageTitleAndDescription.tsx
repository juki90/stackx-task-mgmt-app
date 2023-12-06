import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

import type { FC } from 'react';
import type { IPageTitleAndDescription } from '@/types';

export const PageTitleAndDescription: FC<IPageTitleAndDescription> = ({
    title,
    description
}) => (
    <Box
        sx={{
            backgroundImage:
                'repeating-linear-gradient(45deg, #acf 0, #136 100px, #acf 200px);',
            backgroundClip: 'text',
            marginBottom: '20px'
        }}
    >
        <Typography
            component="h1"
            variant="h3"
            sx={{
                color: 'transparent',
                fontWeight: 'bold',
                marginBottom: '10px'
            }}
        >
            {title}
        </Typography>
        {description ? (
            <Typography component="p" variant="h6">
                {description}
            </Typography>
        ) : null}
    </Box>
);

PageTitleAndDescription.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string
};
