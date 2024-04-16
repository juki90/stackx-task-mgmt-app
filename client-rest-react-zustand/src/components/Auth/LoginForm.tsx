import { useMemo, type FC } from 'react';
import {
    Box,
    Button,
    styled,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';

import { useLogin } from '@/hooks/auth/useLogin';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const LoginForm: FC = () => {
    const {
        theme,
        isFormValid,
        emailErrorMessage,
        otherResponseError,
        generalErrorMessage,
        loginResponseFailed,
        passwordErrorMessage,
        loginResponseSuccess,
        loginResponsePending,
        emailFieldController,
        loginButtonAttributes,
        passwordFieldController,
        handleLogin
    } = useLogin();

    const { StyledErrorText, StyledTextField } = useMemo(() => {
        const StyledErrorText = styled(Typography)(({ theme }) => ({
            color: theme.palette.error.light,
            marginBottom: '15px'
        }));
        const StyledTextField = styled(TextField)(({ theme }) => ({
            marginBottom: theme.spacing(3),
            input: {
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.grey[200],
                marginBottom: theme.spacing(1),
                color: theme.palette.grey[800]
            },
            '& .MuiInputBase-root': {
                backgroundColor: 'tranparent !important'
            }
        }));

        return {
            StyledTextField,
            StyledErrorText
        };
    }, []);

    return (
        <ErrorBoundary>
            <Box
                sx={{
                    color: theme.palette.primary.contrastText,
                    width: `calc(100% - ${theme.spacing(2)})`,
                    margin: `${theme.spacing(2)} auto 0 auto`,
                    padding: theme.spacing(4),
                    borderRadius: `${theme.shape.borderRadius}px`,
                    backgroundColor: 'rgba(30, 80, 115, 1)'
                }}
            >
                <Typography
                    variant="h4"
                    component="h2"
                    textAlign="center"
                    mb="15px"
                >
                    Sign in
                </Typography>
                <Typography variant="body1" component="p">
                    Log in to the system using your email and password. In case
                    of forgotten password, please contact your administrator.
                </Typography>

                <Box sx={{ margin: '25px 0 15px 0' }}>
                    <form>
                        <StyledTextField
                            fullWidth
                            id="email"
                            label="Email"
                            variant="filled"
                            size="small"
                            name="email"
                            error={!!emailErrorMessage}
                            helperText={emailErrorMessage}
                            inputProps={{
                                value: emailFieldController.field.value,
                                onChange: emailFieldController.field.onChange,
                                onBlur: emailFieldController.field.onBlur
                            }}
                            inputRef={emailFieldController.field.ref}
                        />
                        <StyledTextField
                            fullWidth
                            id="password"
                            label="Password"
                            type="password"
                            variant="filled"
                            size="small"
                            name="password"
                            error={!!passwordErrorMessage}
                            helperText={passwordErrorMessage}
                            inputProps={{
                                value: passwordFieldController.field.value,
                                onChange:
                                    passwordFieldController.field.onChange,
                                onBlur: passwordFieldController.field.onBlur
                            }}
                            inputRef={passwordFieldController.field.ref}
                        />
                        <Box
                            sx={{
                                height: '60px'
                            }}
                        >
                            <Button
                                size="large"
                                variant="contained"
                                onClick={handleLogin}
                                disabled={
                                    !isFormValid ||
                                    loginResponsePending ||
                                    loginResponseSuccess
                                }
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    width: '100%',
                                    marginBottom: '15px',
                                    backgroundColor: `${loginButtonAttributes.backgroundColor} !important`,
                                    color: `${theme.palette.text.primary} !important`
                                }}
                            >
                                {loginButtonAttributes.message}
                                {loginResponsePending ? (
                                    <CircularProgress
                                        size={20}
                                        sx={{ marginLeft: '20px' }}
                                    />
                                ) : null}
                            </Button>
                            {generalErrorMessage ? (
                                <StyledErrorText>
                                    {generalErrorMessage}
                                </StyledErrorText>
                            ) : (
                                ''
                            )}
                            {otherResponseError ? (
                                <StyledErrorText>
                                    {otherResponseError}
                                </StyledErrorText>
                            ) : (
                                ''
                            )}
                            {loginResponseFailed && generalErrorMessage ? (
                                <StyledErrorText>
                                    {generalErrorMessage}
                                </StyledErrorText>
                            ) : (
                                ''
                            )}
                        </Box>
                    </form>
                </Box>
            </Box>
        </ErrorBoundary>
    );
};
