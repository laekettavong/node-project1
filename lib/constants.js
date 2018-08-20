const lib = {
    Endpoints : {
        USERS : 'users',
        TOKENS : 'tokens',
        CHECKS : 'checks'
    },
    DisplayText : {
        MISSING_REQUIRED_FIELD : 'Missing required field',
        MISSING_REQUIRED_FIELDS : 'Missing required fields',
        MISSING_INVALID_REQUIRED_FIELDS : 'Missing required field(s) or field(s) are invalid',
        MISSING_FIELDS_TO_UPDATE : 'Missing fields to update',
        MISSING_INVALID_TOKEN : 'Missing required token in header, or token is invalid',
        MISSING_REQUIRED_INPUTS : 'Missing required inputs, or inputs are invalid',
        CANNOT_FIND_USER : 'Cannot find the specified user',
        CANNOT_FIND_TOKEN : 'Cannot find the specified token',
        CANNOT_CREATE_USER : ' Cannot create the new user',
        CANNOT_CREATE_CHECK : 'Could not create the new check',
        CANNOT_HASH_USER_PASSWORD : 'Cannot hash user\'s password',
        CANNOT_UPDATE_USER : ' Cannot update the user',
        CANNOT_UPDATE_USER_WITH_NEW_CHECK : 'Could not update the user with the new check',
        CANNOT_DELETE_USER : 'Could not delete the specified user',
        CANNOT_DELETE_CHECK_DATA : 'Cannot delete the check data',
        CANNOT_REMOVE_USER_CHECK_LIST : 'Could not find the user who created the check, so could not remove the check from the list of checks on the user object',
        USER_DOES_NOT_EXIST : 'The specified user does not exist',
        TOKEN_DOES_NOT_EXIST : 'The specified token does not exist',
        CHECK_ID_DOES_NOT_EXIST : 'The check ID does not exist',
        USER_ALREADY_EXIST : 'A user with phone number already exist',
        TOKEN_EXPIRED : 'The token has already expired, and cannot be extended',
        INVALID_PASSOWRD : 'Password did not match the specified user\'s stored password',
        CANNOT_CREATE_TOKEN : 'Could not create the new token',
        CANNOT_UPDATE_TOKEN : 'Could not update the token\'s expiration',
        CANNOT_UPDATE_CHECK : 'Could not update the check',
        CANNOT_DELETE_CHECK : 'Could not find the check on the user\'s object, so could not remove it',
        ERRORS_ENCOUNTERED_DELETE_CHECKS : 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully.'
    },
    Arrays : {
        acceptableMethods : ['get', 'post', 'put', 'delete'],
        acceptableProtocols : ['https', 'http'],
        acceptableStates : ['up', 'down']
    },
    ConsoleColors : {
        RED : '\x1b[31m%s\x1b[0m',
        GREEN : '\x1b[32m%s\x1b[0m',
        YELLOW : '\x1b[33m%s\x1b[0m',
        MAGENTA : '\x1b[35m%s\x1b[0m',
        LIGHT_BLUE: '\x1b[36m%s\x1b[0m'
    }

}

module.exports = lib;