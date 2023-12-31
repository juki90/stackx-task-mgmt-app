export const en = {
    serverStartedOnPort: 'Server started on port',
    internalServerError: 'An unknown error occured on our server',
    loginSessionExpired: 'Login session expired, logging out',
    fixFormErrors: 'Fix forms errors',
    loggedOut: 'You are logged out',
    successfullyLoggedIn: 'Successfully logged in',
    ourServerIsDown: 'Our server is down, please try later',
    yourAreOffline: 'Please check if you are online',
    successfullyRefetchedData: 'Successfully refetched data',
    failedToRefetchedData: 'Failed to refetch data',
    invalidAccessToken: 'Invalid access token',
    failedToQueryWithFilter:
        'Failed to query by filter, please try again in a few seconds',
    successfullySaved: 'Record has been saved',
    successfullyDeleted: 'Record has been deleted',
    modifiedResourceNotFound:
        "The resource you are modifying doesn't exist anymore",
    notFoundShowing: 'The record you are looking for is not found',
    successfullyCancelledTask: 'Successfully cancelled this task',
    successfullyMarkedTaskAsDone: 'Task is successfully marked as done',
    redirectBecauseOfForbiddenAction:
        'Forbidden action for your role, redirecting...',
    validators: {
        shared: {
            fieldShouldBeString: 'Field should be of type string',
            fieldShouldNotBeEmpty: 'Field should not be empty',
            fieldShouldBeAnEmail: 'Field should be a valid email',
            fieldShouldBeBoolean: 'Field should be boolean',
            fieldShouldBeInteger: 'Field should be integer',
            fieldShouldBeArray: 'Field should be array',
            fieldShouldBeUuid: 'Field should be in correct UUID format',
            fetchPageIndexIncorrectNumber: 'Param should be at least 0',
            pageSizeShouldNotBeEmpty: "Page 'size' value should not be empty",
            pageSizeShouldBeInteger: "Page 'size' value should not be integer",
            pageSizeShouldBeCorrectRange:
                "Page 'size' value should be between 1 and 50",
            pageIndexShouldNotBeEmpty: "Page 'index' value should not be empty",
            pageIndexShouldBeInteger:
                "Page 'index' value should not be integer",
            pageIndexShouldBeCorrectRange:
                "Page 'index' value should be at least 0",
            incorrectPasswordLength: 'Password should contain 8-32 characters',
            fetchParamShouldBeObject: 'Query param should be object',
            filterShouldBeString: "Field inside 'filter' should be a string",
            filterFieldShouldNotBeEmpty:
                "Field inside 'filter' should not be empty",
            onlyOneFilterFieldShouldBeActive:
                "Only one field inside 'filter' should be present"
        },
        auth: {
            incorrectEmailOrPassword: 'Incorrect email or password'
        },
        users: {
            nameIncorrectLength: 'Field should contain 2-32 characters',
            userWithThisEmailExists: 'User with this email already exists',
            notUpdatableUserByYou: "This user can't be updated by you",
            notDeletableUserByYou: "This user can't be deleted by you",
            unableToDeleteYourself: "You can't delete yourself",
            cantRemoveAdminRole: "You can't remove your admin role"
        },
        tasks: {
            descriptionIncorrectLength:
                'This field should have at most 3000 characters',
            titleIncorrectLength: 'This field should have 2-128 characters',
            userIdsIncorrectAmount:
                'This field should be array with 1-50 items',
            notAllUsersFromArrayExist:
                "Some users from list don't exist anymore",
            notAllowedTaskStatus: 'Not allowed status. Should be -1 or 1',
            alreadyCancelled: 'Task is already cancelled',
            youDontBelongToThisTask:
                "You don't belong to this task, hence you can't change its status",
            onlyAdminCanCancelTask: 'Only administrators can cancel tasks',
            unsupportedStatusChange: 'Unsupported status change',
            alreadyDone: 'This task is already done'
        }
    }
};
