import { Box, styled, Container, Divider, Typography } from '@mui/material';

import { LoginForm } from '@/components/Auth/LoginForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { FC } from 'react';

const LoginPage: FC = () => {
    const StyledContainerBox = styled(Box)(() => ({
        minHeight: '100vh',
        width: '100%',
        paddingBottom: '20px'
    }));

    const StyledTitleBox = styled(Box)(({ theme }) => ({
        paddingTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: `calc(100% - ${theme.spacing(2)})`,
        color: theme.palette.grey[900],
        textAlign: 'center'
    }));

    return (
        <ErrorBoundary>
            <StyledContainerBox>
                <Container maxWidth="sm">
                    <StyledTitleBox
                        sx={{
                            backgroundImage:
                                'repeating-linear-gradient(to bottom, #fff 10px, #000 11px, #000 20px, #fff 22px);',
                            backgroundClip: 'text'
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'transparent',
                                textShadow:
                                    '4px 4px 0 rgba(70, 170, 255, 0.5), 4px 4px 140px rgba(70, 170, 255, 1)'
                            }}
                            variant="h2"
                            component="h1"
                        >
                            <b>StackX</b>
                        </Typography>
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{ color: 'rgba(50, 90, 125, 1)', opacity: 0.9 }}
                        >
                            Task Management
                        </Typography>
                    </StyledTitleBox>
                    <Divider />
                    <LoginForm />
                </Container>
            </StyledContainerBox>
        </ErrorBoundary>
    );
};

export default LoginPage;
