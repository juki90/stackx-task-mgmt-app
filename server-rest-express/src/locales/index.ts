export const en = {
    serverStartedOnPort: 'Server started on port',
    internalServerError: 'An unknown errors occured on our sever',
    loginSessionExpired: 'Login session expired, logging out',
    validators: {
        shared: {
            fieldShouldBeString: 'Field should be of type string',
            fieldShouldNotBeEmpty: 'Field should not be empty',
            fieldShouldBeAnEmail: 'Field should be a valid email',
            fieldShuoldBeBoolean: 'Field should be boolean',
            fieldShouldBeInteger: 'Field should be integer',
            fetchPageIndexIncorrectNumber: 'Param should be at least 0',
            pageSizeShouldNotBeEmpty: "Page 'size' value should not be empty",
            pageSizeShouldBeInteger: "Page 'size' value should not be integer",
            pageSizeShouldBeCorrectRange:
                "Page 'size' value should be between 1 and 50",
            pageIndexShouldNotBeEmpty: "Page 'index' value should not be empty",
            pageIndexShouldBeInteger:
                "Page 'index' value should not be integer",
            pageIndexShouldBeCorrectRange:
                "Page 'index' value should be between at least 0",
            fetchParamShouldBeObject: 'Query param should be object',
            filterShouldBeString: "Field inside 'filter' should be a string",
            filterFieldShouldNotBeEmpty:
                "Field inside 'filter' should not be empty",
            onlyOneFilterFieldShouldBeActive:
                "Only one field inside 'filter' should be present"
        },
        auth: {
            passwordWithIncorrectLength:
                'Password should have between 8 and 32 characters',
            incorrectEmailOrPassword: 'Incorrect email or password'
        },
        users: {
            nameIncorrectLength: 'Field should contain 2-32 characters',
            incorrectPasswordLength: 'Password should contain 8-32 characters',
            userWithThisEmailExists: 'User with this email already exists',
            notUpdatableUserByYou: "This user can't be updated by you",
            notDeletableUserByYou: "This user can't be deleted by you",
            unableToDeleteYourself: "You can't delete yourself"
        }
    }
};
