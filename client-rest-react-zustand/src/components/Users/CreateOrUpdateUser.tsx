import PropTypes from 'prop-types';
import { useMemo, type FC } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import {
    Box,
    Modal,
    styled,
    Button,
    Checkbox,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';

import { useCreateOrUpdateUser } from '@/hooks/users/useCreateOrUpdateUser';

import type { User, ICreateOrUpdateUser } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const CreateOrUpdateUser: FC<ICreateOrUpdateUser> = ({
    user,
    isModalOpen,
    handleCloseModal
}) => {
    const {
        theme,
        loggedUser,
        isFormValid,
        emailErrorMessage,
        otherResponseError,
        passwordErrorMessage,
        emailFieldController,
        saveButtonAttributes,
        lastNameErrorMessage,
        firstNameErrorMessage,
        createOrUpdateSuccess,
        createOrUpdatePending,
        isAdminFieldController,
        lastNameFieldController,
        passwordFieldController,
        firstNameFieldController,
        isPasswordCheckboxChecked,
        resetForm,
        handleSaveUser,
        setOtherResponseError,
        checkIfFormValuesChanged,
        setIsPasswordCheckboxChecked
    } = useCreateOrUpdateUser(user, handleCloseModal);

    const { StyledErrorText, StyledTextField } = useMemo(() => {
        const StyledErrorText = styled(Typography)(({ theme }) => ({
            color: theme.palette.error.light,
            marginBottom: '15px'
        }));
        const StyledTextField = styled(TextField)(({ theme }) => ({
            marginBottom: theme.spacing(3),
            input: {
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.getContrastText(
                    theme.palette.grey[800]
                ),
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
            <Modal
                open={!!isModalOpen}
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <Box
                    sx={{
                        margin: '25px auto 15px auto',
                        padding: '35px 35px 50px 35px',
                        maxWidth: '500px',
                        borderRadius: '5px',
                        backgroundColor: theme.palette.grey['200']
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                marginBottom: '35px'
                            }}
                        >
                            {user ? 'Update' : 'Create'} user
                        </Typography>
                        <Button
                            sx={{
                                marginLeft: 'auto',
                                color: theme.palette.grey['800'],
                                backgroundColor: theme.palette.grey['300']
                            }}
                            onClick={() => {
                                resetForm();
                                handleCloseModal();
                                setOtherResponseError('');
                            }}
                        >
                            <ClearIcon />
                        </Button>
                    </Box>
                    {user ? (
                        <Typography
                            variant="body1"
                            component="p"
                            sx={{
                                marginBottom: '15px'
                            }}
                        >
                            You are about to edit user:{' '}
                            <b>{`${user.fullName} (${user.email})`}</b>
                        </Typography>
                    ) : null}
                    <form>
                        <StyledTextField
                            fullWidth
                            id="firstName"
                            label="First name"
                            variant="filled"
                            size="small"
                            name="email"
                            error={!!firstNameErrorMessage}
                            helperText={firstNameErrorMessage}
                            inputProps={{
                                value: firstNameFieldController.field.value,
                                onChange:
                                    firstNameFieldController.field.onChange,
                                onBlur: firstNameFieldController.field.onBlur
                            }}
                            inputRef={firstNameFieldController.field.ref}
                        />
                        <StyledTextField
                            fullWidth
                            id="lastName"
                            label="Last name"
                            variant="filled"
                            size="small"
                            name="lastName"
                            error={!!lastNameErrorMessage}
                            helperText={lastNameErrorMessage}
                            inputProps={{
                                value: lastNameFieldController.field.value,
                                onChange:
                                    lastNameFieldController.field.onChange,
                                onBlur: lastNameFieldController.field.onBlur
                            }}
                            inputRef={lastNameFieldController.field.ref}
                        />
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
                        {user ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}
                            >
                                <Checkbox
                                    checked={isPasswordCheckboxChecked}
                                    onChange={e =>
                                        setIsPasswordCheckboxChecked(
                                            e.target.checked
                                        )
                                    }
                                />
                                <Typography>Disable password change</Typography>
                            </Box>
                        ) : null}
                        <StyledTextField
                            fullWidth
                            id="password"
                            label="Password"
                            type="password"
                            variant="filled"
                            size="small"
                            name="password"
                            disabled={isPasswordCheckboxChecked && !!user}
                            error={
                                !isPasswordCheckboxChecked &&
                                !!passwordErrorMessage
                            }
                            helperText={
                                !isPasswordCheckboxChecked &&
                                passwordErrorMessage
                            }
                            inputProps={{
                                value: passwordFieldController.field.value,
                                onChange:
                                    passwordFieldController.field.onChange,
                                onBlur: passwordFieldController.field.onBlur
                            }}
                            inputRef={passwordFieldController.field.ref}
                        />
                        {!(loggedUser as User)?.createdById &&
                        (loggedUser as User).id !== user?.id ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}
                            >
                                <Checkbox
                                    checked={isAdminFieldController.field.value}
                                    onChange={e =>
                                        isAdminFieldController.field.onChange(
                                            e.target.checked
                                        )
                                    }
                                    onBlur={isAdminFieldController.field.onBlur}
                                    ref={isAdminFieldController.field.ref}
                                />{' '}
                                <Typography>
                                    Set ADMIN role for this user
                                </Typography>
                            </Box>
                        ) : (loggedUser as User)?.createdById ? (
                            <Typography sx={{ marginBottom: '15px' }}>
                                The user will be {user ? 'updated' : 'created'}{' '}
                                as a regular user
                            </Typography>
                        ) : (
                            <Typography sx={{ marginBottom: '15px' }}>
                                You can't downgrade your role. You are main
                                administrator and you can't change that nor
                                delete yourself
                            </Typography>
                        )}
                        <Box
                            sx={{
                                height: '60px'
                            }}
                        >
                            <Button
                                size="large"
                                variant="contained"
                                onClick={handleSaveUser}
                                disabled={
                                    (user &&
                                        (!checkIfFormValuesChanged() ||
                                            !isFormValid)) ||
                                    (!user && !isFormValid) ||
                                    createOrUpdatePending ||
                                    createOrUpdateSuccess
                                }
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    marginBottom: '15px',
                                    justifyContent: 'center',
                                    color: `${theme.palette.text.primary} !important`,
                                    backgroundColor: `${saveButtonAttributes.backgroundColor} !important`
                                }}
                            >
                                {saveButtonAttributes.message}
                                {createOrUpdatePending ? (
                                    <CircularProgress
                                        size={20}
                                        sx={{ marginLeft: '20px' }}
                                    />
                                ) : null}
                            </Button>
                            {otherResponseError ? (
                                <StyledErrorText>
                                    {otherResponseError}
                                </StyledErrorText>
                            ) : (
                                ''
                            )}
                        </Box>
                    </form>
                </Box>
            </Modal>
        </ErrorBoundary>
    );
};

CreateOrUpdateUser.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    handleCloseModal: PropTypes.func.isRequired
};
