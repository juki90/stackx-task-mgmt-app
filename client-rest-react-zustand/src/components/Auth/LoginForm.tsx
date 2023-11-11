import {
    Box,
    Button,
    styled,
    // useTheme,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';

import { useLogin } from '@/hooks/auth/useLogin';

import { useMemo, type FC } from 'react';

export const LoginForm: FC = () => {
    const {
        theme,
        control,
        formErrors,
        isFormValid,
        emailErrorMessage,
        generalErrorMessage,
        passwordErrorMessage,
        loginResponseData,
        loginResponseError,
        loginResponseFailed,
        loginResponsePending,
        emailFieldController,
        loginResponseSuccess,
        loginButtonAttributes,
        passwordFieldController,
        watch,
        setValue,
        getValues,
        clearErrors,
        handleLogin,
        mutateLogin,
        resetLoginResponse
    } = useLogin();

    const { StyledButton, StyledTextField, StyledErrorText } = useMemo(() => {
        const StyledTextField = styled(TextField)(({ theme }) => ({
            marginBottom: theme.spacing(3),
            input: {
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.grey[200],
                marginBottom: theme.spacing(1),
                color: theme.palette.grey[800]
            }
        }));

        const StyledErrorText = styled(Typography)(({ theme }) => ({
            color: theme.palette.error.light,
            marginBottom: '15px'
        }));

        const StyledButton = styled(Button)(({ theme }) => ({
            color: `${theme.palette.text.primary} !important`,
            width: '100%',
            marginBottom: '15px'
        }));

        return {
            StyledButton,
            StyledTextField,
            StyledErrorText
        };
    }, [theme]);

    return (
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
                        onChange: passwordFieldController.field.onChange,
                        onBlur: passwordFieldController.field.onBlur
                    }}
                    inputRef={passwordFieldController.field.ref}
                />
                <Box
                    sx={{
                        height: '60px'
                    }}
                >
                    <StyledButton
                        size="large"
                        variant="contained"
                        onClick={handleLogin}
                        disabled={!isFormValid || loginResponsePending}
                        sx={{
                            backgroundColor: `${loginButtonAttributes.backgroundColor} !important`
                        }}
                    >
                        {loginButtonAttributes.message}
                    </StyledButton>
                    {generalErrorMessage ? (
                        <StyledErrorText>{generalErrorMessage}</StyledErrorText>
                    ) : (
                        ''
                    )}
                    {loginResponsePending ? (
                        <CircularProgress
                            sx={{ display: 'block', margin: '0 auto' }}
                        />
                    ) : null}
                    {loginResponseFailed && generalErrorMessage ? (
                        <StyledErrorText>{generalErrorMessage}</StyledErrorText>
                    ) : (
                        ''
                    )}
                </Box>
            </form>
        </Box>
    );
};
