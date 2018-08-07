/*
* Request handlers
*/

// Dependencies
const Utils = require('./utils');
const _data = require('./data');
const Constants = require('./constants');
const StringUtils = Utils.string;
const CryptoUtils = Utils.crypto;
const Endpoints = Constants.Endpoints;
const DisplayText = Constants.DisplayText;

// Define the handlers
const handlers = {
    // Sample handler
    ping : (data, callback) => {
        // Callback a HTTP status code, and a payload object
        callback(406, {name: 'sample handler'});
    },
    users : (data, callback) =>{
        let acceptableMethods = ['get', 'post', 'put', 'delete'];
        if(acceptableMethods.includes(data.method.toLowerCase())){
            UsersCrud[data.method.toLowerCase()](data, callback);
        } else {
            callback(405);
        }
    },
    tokens : (data, callback) =>{
        let acceptableMethods = ['get', 'post', 'put', 'delete'];
        if(acceptableMethods.includes(data.method.toLowerCase())){
            TokensCrud[data.method.toLowerCase()](data, callback);
        } else {
            callback(405);
        }
    }
}

const UsersCrud = {
    // Required data: firstName, lastName, phone, password, tosAgreement
    // Optional data: none
    post : (data, callback) => {
        // Check that all the required fields are fill out
        let firstName = StringUtils.isValidString(data.payload.firstName);
        let lastName = StringUtils.isValidString(data.payload.lastName);
        let phone = StringUtils.isValidStringPhoneNumber(data.payload.phone);
        let password = StringUtils.isValidString(data.payload.password);
        let tosAgreement = StringUtils.isValidBoolean(data.payload.tosAgreement);
        if(firstName && lastName && phone && password && tosAgreement){
            // Make sure the user doesn't already exist
            _data.read(Endpoints.USERS, phone, (err, data) => {
                if(err){
                    // Hash the library
                    let hashedPassword = CryptoUtils.hash(password);
                    if(hashedPassword){
                        // Create the user objec
                        let userObj = {
                            firstName: firstName,
                            lastName : lastName,
                            phone : phone,
                            hashedPassword : hashedPassword,
                            tosAgreement : true
                        }

                        // Store the user
                        _data.create(Endpoints.USERS, phone, userObj, (err) => {
                            if(!err){
                                callback(200);
                            } else {
                                consoloe.log(err);
                                callback(500, {Error : DisplayText.CANNOT_CREATE_USER});
                            }
                        })
                    } else {
                        callback(500, {Error : DisplayText.CANNOT_HASH_USER_PASSWORD});
                    }
                } else {
                    // USer already exists
                    callback(400, {Error : DisplayText.USER_ALREADY_EXIST})
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELDS});
        }
    },
    // Require data: phone
    // Optional data: none
    // @TODO only let tan authenticated user access their object, don't let them access anyone else's
    get : (data, callback) => {
        // Check that thge phone is valid
        let phone = StringUtils.isValidStringPhoneNumber(data.queryString.phone);
        if(phone){
            console.log(data.headers);
            let token = StringUtils.isValidString(data.headers.token);
            //console.log("Token: ", token);
            TokenHelper.verifyToken(token, phone, (isValidToken) => {
                //console.log("isValidToke: ", isValidToken);
                if(isValidToken){
                    _data.read(Endpoints.USERS, phone, (err, data) => {
                        if(!err && data){
                            // Remove the hashed password from the user object before returning it to the requester
                            delete data.hashedPassword;
                            callback(200, data);
                        }else {
                            callback(400);
                        }
                    })
                } else {
                    callback(403, {Error : DisplayText.MISSING_INVALID_TOKEN});
                }
            });
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD});
        }
    },
    // Required data: phone
    // Optional data: firstName, lastName, password ( at least must be specified)
    put : (data, callback) => {
        // Check for the required field
        let phone = StringUtils.isValidStringPhoneNumber(data.payload.phone);
        // Check for optional fields
        let firstName = StringUtils.isValidString(data.payload.firstName);
        let lastName = StringUtils.isValidString(data.payload.lastName);
        let password = StringUtils.isValidString(data.payload.password);

        if(phone){
            // Error id nothing is sent to update
            if(firstName || lastName || password){
                let token = StringUtils.isValidString(data.headers.token);
                TokenHelper.verifyToken(token, phone, (isValidToken) => {
                    if(isValidToken){
                        _data.read(Endpoints.USERS, phone, (err, userData) => {
                            if(!err && userData){
                                // Update the specified fields
                                if(firstName){
                                    userData.firstName = firstName
                                }
                                if(lastName){
                                    userData.lastName = lastName;
                                }
                                if(password){
                                    userData.hashedPassword = CryptoUtils.hash(password);
                                }
        
                                // Persist data
                                _data.update(Endpoints.USERS, phone, userData, (err) => {
                                    if(!err){
                                        callback(200);
                                    } else {
                                        consolog.log(err);
                                        callback(500, {Error : DisplayText.CANNOT_UPDATE_USER})
                                    }
                                })
                
                            } else {
                                callback(400, {Error : DisplayText.USER_DOES_NOT_EXIST});
                            }
                        });
                    } else {
                        callback(403, {Error : DisplayText.MISSING_INVALID_TOKEN});
                    }
                });
            } else {
                callback(400, {Error : DisplayText.MISSING_FIELDS_TO_UPDATE});
            }
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    },
    // Required data: phone
    // @TODO cleanup (delete) any other data files associated with the user
    delete : (data, callback) => {
        let phone = StringUtils.isValidStringPhoneNumber(data.queryString.phone);
        if(phone){
            TokenHelper.verifyToken(token, phone, (isValidToken) => {
                if(isValidToken){
                    _data.read(Endpoints.USERS, phone, (err, data) => {
                        if(!err && data){
                            _data.delete(Endpoints.USERS, phone, (err) => {
                                if(!err){
                                    callback(200);
                                } else {
                                    callback(500, {Error : DisplayText.CANNOT_FIND_USER})
                                }
                            })
                        }else {
                            callback(400, {Error : DisplayText.CANNOT_FIND_USER});
                        }
                    });
                } else {
                    callback(403, {Error : DisplayText.MISSING_INVALID_TOKEN});
                }
            });
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    }
}

const TokensCrud = {
    // Required data: phone, password
    // Optional data: none
     post : (data, callback) => {
        let phone = StringUtils.isValidStringPhoneNumber(data.payload.phone);
        let password = StringUtils.isValidString(data.payload.password);
        if(phone && password){
            // Lookup user that matches the phone numbaber
            _data.read(Endpoints.USERS, phone, (err, userData) => {
                if(!err && userData){
                    // Hased the incoming password, and compare it with the password stored in the user object
                    let hashedPassword = CryptoUtils.hash(password);
                    // If valid create a new token wiht a random name. Set expiration date 1 hour in the future
                    if(CryptoUtils.isAuthenticated(hashedPassword, userData.hashedPassword)){
                        let tokenId = CryptoUtils.createRandomString(20);
                        let expires = Date.now() + 1000 * 60 * 60;
                        let tokenObj = {
                            phone : phone,
                            id : tokenId,
                            expires : expires
                        }

                        _data.create(Endpoints.TOKENS, tokenId, tokenObj, (err) => {
                            if(!err){
                                callback(200, tokenObj)
                            } else {
                                callback(500, {Error : DisplayText.MISSING_REQUIRED_FIELD});
                            }
                        })
                    } else {
                        callback(400, {Error : DisplayText.INVALID_PASSOWRD});
                    }
                } else {
                    callback(400, {Error : DisplayText.CANNOT_FIND_USER})
                }
            })

        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELDS})
        }
     },
     // Require data: id
     // Optional data: none
     get : (data, callback) => {
         // Check that the id is valid
         let id = StringUtils.isValidString(data.queryString.id);
         if(id){
            _data.read(Endpoints.TOKENS, id, (err, tokenData) => {
                if(!err && tokenData){
                    callback(200, tokenData);
                } else {
                    callback(404);
                }
            })
         } else {
             callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
         }
    },
    // Required data: id, extend
    // Optional data: none
    put : (data, callback) => {
        let id = StringUtils.isValidString(data.payload.id);
        let extend = StringUtils.isValidBoolean(data.payload.extend);
        if(id && extend){
            _data.read(Endpoints.TOKENS, id, (err, tokenData) => {
                if(!err && tokenData){
                    // Check make sure the token isn't already expired
                    if(tokenData.expires > Date.now()){
                        tokenData.expires = Date.now() + 1000 * 60 * 60;
                        _data.update(Endpoints.TOKENS, id, tokenData, (err) => {
                            if(!err){
                                callback(200);
                            } else {
                                callback(500, {Error : DisplayText.CANNOT_UPDATE_TOKEN});
                            }
                        })
                    } else {
                        callback(400, {Error : DisplayText.TOKEN_EXPIRED});
                    }
                } else {
                    callback(400, {Error : DisplayText.TOKEN_DOES_NOT_EXIST});
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_INVALID_REQUIRED_FIELDS});
        }
    },
    // Require data: id
    // Optional data: none
    delete : (data, callback) => {
        let id = StringUtils.isValidString(data.queryString.id);
        if(id){
            _data.read(Endpoints.TOKENS, id, (err, data) => {
                if(!err && data){
                    _data.delete(Endpoints.TOKENS, id, (err) => {
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {Error : DisplayText.CANNOT_FIND_TOKEN + "100"})
                        }
                    })
                }else {
                    callback(400, {Error : DisplayText.CANNOT_FIND_TOKEN + "200"});
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    }
}

const TokenHelper = {
    verifyToken : (id, phone, callback) => {
        _data.read(Endpoints.TOKENS, id, (err, tokenData) => {
            if(!err && tokenData){
                if(tokenData.phone === phone && tokenData.expires > Date.now()){
                    callback(true);
                } else {
                    callback(false);
               }
            } else {
                callback(false);
            }
        })
    }
}

module.exports = handlers;