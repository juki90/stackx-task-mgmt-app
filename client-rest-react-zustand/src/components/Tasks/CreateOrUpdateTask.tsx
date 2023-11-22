import PropTypes from 'prop-types';
import { useMemo, type FC } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import {
    Box,
    Modal,
    styled,
    Button,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UserListPicker } from '@/components/UserListPicker';
import { useCreateOrUpdateTask } from '@/hooks/tasks/useCreateOrUpdateTask';

import type { ICreateOrUpdateTask } from '@/types';

export const CreateOrUpdateTask: FC<ICreateOrUpdateTask> = ({
    task,
    isModalOpen,
    setIsCreateOrUpdateModalOpen
}) => {
    const {
        theme,
        isFormValid,
        titleErrorMessage,
        otherResponseError,
        generalResponseError,
        saveButtonAttributes,
        titleFieldController,
        createOrUpdateSuccess,
        createOrUpdatePending,
        userIdsFieldController,
        descriptionErrorMessage,
        descriptionFieldController,
        handleSaveTask,
        handleCloseModal,
        checkIfFormValuesChanged
    } = useCreateOrUpdateTask({
        task,
        setIsCreateOrUpdateModalOpen
    });

    const { StyledErrorText, StyledTextField } = useMemo(() => {
        const StyledErrorText = styled(Typography)(({ theme }) => ({
            color: theme.palette.error.light,
            marginBottom: '15px'
        }));
        const StyledTextField = styled(TextField)(({ theme }) => ({
            marginBottom: theme.spacing(3),
            input: {
                borderRadius: theme.shape.borderRadius,
                backgroundColor: `${theme.palette.getContrastText(
                    theme.palette.grey[800]
                )} !important`,
                marginBottom: theme.spacing(1),
                color: theme.palette.grey[800]
            },
            '& .MuiInputBase-root': {
                backgroundColor: `${theme.palette.getContrastText(
                    theme.palette.grey[800]
                )} !important`
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
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        margin: '25px 10px 15px 10px',
                        padding: '35px 35px 50px 35px',
                        maxWidth: '500px',
                        borderRadius: '5px',
                        backgroundColor: theme.palette.grey['200'],
                        maxHeight: '95vh',
                        overflowY: 'scroll'
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
                            {task ? 'Update' : 'Create'} task
                        </Typography>
                        <Button
                            sx={{
                                marginLeft: 'auto',
                                color: theme.palette.grey['800'],
                                backgroundColor: theme.palette.grey['300']
                            }}
                            onClick={handleCloseModal}
                        >
                            <ClearIcon />
                        </Button>
                    </Box>
                    {task ? (
                        <Typography
                            variant="body1"
                            component="p"
                            sx={{
                                marginBottom: '15px'
                            }}
                        >
                            You are about to edit task: <b>{task.title}</b>
                        </Typography>
                    ) : null}
                    <form>
                        <StyledTextField
                            fullWidth
                            id="title"
                            label="Title"
                            variant="filled"
                            size="small"
                            name="title"
                            error={!!titleErrorMessage}
                            helperText={titleErrorMessage}
                            inputProps={{
                                value: titleFieldController.field.value,
                                onChange: titleFieldController.field.onChange,
                                onBlur: titleFieldController.field.onBlur
                            }}
                            inputRef={titleFieldController.field.ref}
                        />
                        <StyledTextField
                            fullWidth
                            multiline
                            minRows={4}
                            id="description"
                            label="Description"
                            variant="filled"
                            size="small"
                            name="description"
                            sx={{ overflowY: 'scroll', maxHeight: '50vh' }}
                            error={!!descriptionErrorMessage}
                            helperText={`${
                                descriptionErrorMessage || ''
                            }, Characters in use: 
                                 ${
                                     descriptionFieldController.field.value
                                         ?.length
                                 } / 3000`}
                            inputProps={{
                                value: descriptionFieldController.field.value,
                                onChange:
                                    descriptionFieldController.field.onChange,
                                onBlur: descriptionFieldController.field.onBlur
                            }}
                            inputRef={descriptionFieldController.field.ref}
                        />
                        <Typography
                            variant="body1"
                            component="p"
                            sx={{
                                marginBottom: '15px'
                            }}
                        >
                            Assign users to this task. It should be assigned to
                            at least 1 user or many, up to 50 users
                        </Typography>
                        <UserListPicker
                            fieldController={userIdsFieldController}
                        />
                        <Box
                            sx={{
                                height: '60px',
                                paddingBottom: '70px'
                            }}
                        >
                            <Button
                                size="large"
                                variant="contained"
                                onClick={handleSaveTask}
                                disabled={
                                    !!otherResponseError ||
                                    !!generalResponseError ||
                                    (task &&
                                        (!checkIfFormValuesChanged() ||
                                            !isFormValid)) ||
                                    (!task && !isFormValid) ||
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
                            {generalResponseError ? (
                                <StyledErrorText>
                                    {generalResponseError}
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
                        </Box>
                    </form>
                </Box>
            </Modal>
        </ErrorBoundary>
    );
};

CreateOrUpdateTask.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    setIsCreateOrUpdateModalOpen: PropTypes.func.isRequired
};
