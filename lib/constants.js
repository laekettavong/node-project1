

const Constants = {
    Endpoints : {
        USERS : 'users',
        TOKENS : 'tokens'
    },
    DisplayText : {
        MISSING_REQUIRED_FIELD : 'Missing required field',
        MISSING_REQUIRED_FIELDS : 'Missing required fields',
        MISSING_INVALID_REQUIRED_FIELDS : 'Missing required field(s) or field(s) are invalid',
        MISSING_FIELDS_TO_UPDATE : 'Missing fields to update',
        MISSING_INVALID_TOKEN : 'Missing required token in header, or token is invalid',
        CANNOT_FIND_USER : 'Cannot find the specified user',
        CANNOT_FIND_TOKEN : 'Cannot find the specified token',
        CANNOT_CREATE_USER : ' Cannot create the new user',
        CANNOT_HASH_USER_PASSWORD : 'Cannot hash user\'s password',
        CANNOT_UPDATE_USER : ' Cannot update the user',
        USER_DOES_NOT_EXIST : 'The specified user does not exist',
        TOKEN_DOES_NOT_EXIST : 'The specified token does not exist',
        USER_ALREADY_EXIST : 'A user with phone number already exist',
        TOKEN_EXPIRED : 'The token has already expired, and cannot be extended',
        INVALID_PASSOWRD : 'Password did not match the specified user\'s stored password',
        CANNOT_CREATE_TOKEN : 'Could not create the new token',
        CANNOT_UPDATE_TOKEN : 'Could not update the token\'s expiration'
    }
}

module.exports = Constants;