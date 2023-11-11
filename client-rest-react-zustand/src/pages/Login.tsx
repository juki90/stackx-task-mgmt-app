import { Box, styled, Container, Divider, Typography } from '@mui/material';

import { LoginForm } from '@/components/Auth/LoginForm';

import type { FC } from 'react';

export const LoginPage: FC = () => {
    const StyledContainerBox = styled(Box)(({ theme }) => ({
        backgroundColor:
            theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[200],
        minHeight: '100vh',
        width: '100%',
        paddingBottom: '20px',
        backgroundImage: `linear-gradient(to bottom, transparent 35vh, rgba(150, 150, 150, 0.5) 35vh);`
    }));

    const StyledTitleBox = styled(Box)(({ theme }) => ({
        paddingTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: `calc(100% - ${theme.spacing(2)})`,
        color: theme.palette.grey[900],
        textAlign: 'center'
    }));

    const StyledFormBox = styled(Box)(({ theme }) => ({
        color: theme.palette.primary.contrastText,
        width: `calc(100% - ${theme.spacing(2)})`,
        margin: `${theme.spacing(2)} auto 0 auto`,
        padding: theme.spacing(4),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.grey[800]
    }));

    return (
        <StyledContainerBox>
            <Container maxWidth="sm">
                <StyledTitleBox>
                    <Typography variant="h2" component="h1">
                        <b>StackX</b>
                    </Typography>
                    <Typography
                        variant="h3"
                        component="p"
                        sx={{ opacity: 0.7 }}
                    >
                        Task Management
                    </Typography>
                </StyledTitleBox>
                <Divider />
                <StyledFormBox>
                    <Typography
                        variant="h4"
                        component="h2"
                        textAlign="center"
                        mb="15px"
                    >
                        Sign in
                    </Typography>
                    <Typography variant="body1" component="p">
                        Log in to the system using your email and password. In
                        case of forgotten password, please contact your
                        administrator.
                    </Typography>
                    <LoginForm />
                </StyledFormBox>
            </Container>
        </StyledContainerBox>
    );
};
