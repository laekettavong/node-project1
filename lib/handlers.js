/*
* Request handlers
*/

// Dependencies
const path = require('path');
const fs = require('fs');
const Utils = require('./utils');
const FsHelper = require('./data');
const FsTemplate = FsHelper.FsTemplate;
const FsPublic = FsHelper.FsPublic;
const Constants = require('./constants');
const Config = require ('./config');
const StringUtils = Utils.string;
const CryptoUtils = Utils.crypto;
const ArrayUtils = Utils.array;
const Endpoints = Constants.Endpoints;
const DisplayText = Constants.DisplayText;

// Define the handlers

const handlers = {
    // Sample handler
    ping : (data, callback) => {
        // Callback a HTTP status code, and a payload object
        callback(200, {Success: 'Server is up'});
    },
    notFound : (data, callback) => {
        callback(404);
    },
    users : (data, callback) =>{
        if(StringUtils.isValidMethod(data.method)) {
            UsersCrud[data.method.toLowerCase()](data, callback);
        } else {
            callback(405);
        }
    },
    tokens : (data, callback) =>{
        if(StringUtils.isValidMethod(data.method)){
            TokensCrud[data.method.toLowerCase()](data, callback);
        } else {
            callback(405);
        }
    },
    checks : (data, callback) =>{
        if(StringUtils.isValidMethod(data.method)){
            ChecksCrud[data.method.toLowerCase()](data, callback);
        } else {
            callback(405);
        }
    },
    index : (data, callback) => {
        if(StringUtils.isValidMethod(data.method)){
            HtmlHandler.index(data, callback);
        } else {
            callback(405);
        }
    },
    favicon : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            StaticAsset.favicon(data, callback);
        } else {
            callback(405);
        }
    },
    public : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            StaticAsset.public(data, callback);
        } else {
            callback(405);
        }
    },
    accountCreate : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            AccountHandler.accountCreate(data, callback);
        } else {
            callback(405);
        }
    },
    accountEdit : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            AccountHandler.accountEdit(data, callback);
        } else {
            callback(405);
        }
    },
    sessionCreate : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            SessionHandler.sessionCreate(data, callback);
        } else {
            callback(405);
        }
    },
    sessionDeleted : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            SessionHandler.sessionDeleted(data, callback);
        } else {
            callback(405);
        }
    },
    checksCreate : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            CheckHandler.checksCreate(data, callback);
        } else {
            callback(405);
        }
    },
    checksList : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            CheckHandler.checksList(data, callback);
        } else {
            callback(405);
        }
    },
    checksEdit : (data, callback) => {
        if(StringUtils.isValidMethod(data.method) && data.method.toLowerCase() == 'get'){
            CheckHandler.checksEdit(data, callback);
        } else {
            callback(405);
        }
    },
    exampleError : (data, callback) => {
        let err = new Error('This is an example error');
        throw err;
    }
}


/*
* HTML API Handlers
*/


const CheckHandler = {
    checksCreate : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Create a new Check',
                'body.class' : 'checksCreate'
            };

            HtmlTemplate.getTemplate('checksCreate', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },
    checksList : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Dashboard',
                'body.class' : 'checksList'
            };

            HtmlTemplate.getTemplate('checksList', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },
    checksEdit : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Check Details',
                'body.class' : 'checksEdit'
            };

            HtmlTemplate.getTemplate('checksEdit', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    }
}

const SessionHandler = {
    sessionCreate : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Login to your Account',
                'head.description' : 'Please enter your phone and password to access you account',
                'body.class' : 'sessionCreate'
            };

            HtmlTemplate.getTemplate('sessionCreate', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },
    sessionDeleted : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Logout',
                'head.description' : 'You have been logged out of your account',
                'body.class' : 'sessionDeleted'
            };

            HtmlTemplate.getTemplate('sessionDeleted', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    }
}

const AccountHandler = {
    accountCreate : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Create an Account',
                'head.description' : 'Sign up is easy and only take s few seconds',
                'body.class' : 'accountCreate'
            };

            HtmlTemplate.getTemplate('accountCreate', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },
    accountEdit : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Account Settings',
                'body.class' : 'accountEdit'
            };

            HtmlTemplate.getTemplate('accountEdit', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },
    accountDeleted : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Account Deleted',
                'head.description' : 'Your account has been deleted',
                'body.class' : 'accountDeleted'
            };

            HtmlTemplate.getTemplate('accountDeleted', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer
                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    },

}

const HtmlHandler = {
    index : (data, callback) => {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {

            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uptime Monitoring - Made Simple',
                'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
                'body.class' : 'index'
            };

            HtmlTemplate.getTemplate('index', templateData, (err, str) => {
                if(!err && str) {
                    // Add the universal header and footer

                    HtmlTemplate.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(500, undefined, 'html');
        }
    }
}

const StaticAsset = {
    favicon : (data, callback) => {
        if(data.method.toLowerCase() == 'get') {
            FsPublic.getStaticAsset('favicon.ico', (err, data) => {
                if(!err && data) {
                    callback(200, data, 'favicon');
                } else {
                    callback(500);
                }
            });
        } else {
            callback(405);
        }
    }, 
    public : (data, callback) => {
        if(data.method.toLowerCase() == 'get') {
            let assetName = data.trimmedPath.replace('public/', '').trim();
            if(assetName.length > 0) {
                FsPublic.getStaticAsset(assetName, (err, data) => {
                    if(!err && data) {
                        let contentType = 'plain';

                        if(assetName.indexOf('.css') > -1){
                            contentType = 'css';
                        }

                        if(assetName.indexOf('.png') > -1){
                            contentType = 'png';
                        }

                        if(assetName.indexOf('.jpg') > -1){
                            contentType = 'jpg';
                        }

                        if(assetName.indexOf('.ico') > -1){
                            contentType = 'favicon';
                        }

                        callback(200, data, contentType);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(404);
            }
        } else {
            callback(405);
        }
    }, 
}

const HtmlTemplate = {
    getTemplate(templateName, data, callback) {
        templateName = StringUtils.isValidString(templateName);
        data = StringUtils.isValidObject(data);
        if(templateName) {
            FsTemplate.readFile(templateName, (err, str) => {
                if(!err && str) {
                    callback(false, HtmlTemplate.interpolate(str, data));
                } else {
                    callback('Template not found');
                }
            });
        } else {
            callback('A valid template name was not specified');
        }
    },
    // Take a given string and a data object and find/replace all the keys within it
    interpolate(str, data) {
        str = !StringUtils.isValidString(str) ? '' : str;
        data = StringUtils.isValidObject(data);

        // Add the templateGlobals to the data object, prepending their key name with "global" 
        for(let key in Config.templateGlobals) {
            if(Config.templateGlobals.hasOwnProperty(key)) {
                data[`global.${key}`] = Config.templateGlobals[key];
            }
        }

        // For each key in the data object, insert its value into the string a the corresponding placeholder
        for(let key in data) {
            if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
                let replace = data[key];
                let find = `{${key}}`;
                str = str.replace(find, replace);
            }
        }

        return str;
    },
    // Add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation
    addUniversalTemplates(str, data, callback) {
        str = !StringUtils.isValidString(str) ? '' : str;
        data = StringUtils.isValidObject(data);
        // Get the header
        HtmlTemplate.getTemplate('_header', data, (err, headerStr) => {
            if(!err && headerStr) {
                // Get the footer
                HtmlTemplate.getTemplate('_footer', data, (err, footerStr) => {
                    if(!err && footerStr) {
                        // Add them all together
                        callback(false, `${headerStr}${str}${footerStr}`);
                    } else {
                        callback('Could not find th footer template');
                    }
                });
            } else {
                callback('Could not find th header template');
            }
        });
    }
}



/*
* JSON API Handlers
*/

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
            FsHelper.read(Endpoints.USERS, phone, (err, data) => {
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
                        FsHelper.create(Endpoints.USERS, phone, userObj, (err) => {
                            if(!err){
                                callback(200);
                            } else {
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
    get : (data, callback) => {
        // Check that thge phone is valid
        let phone = StringUtils.isValidStringPhoneNumber(data.queryString.phone);
        if(phone){
            let token = StringUtils.isValidString(data.headers.token);
            Validator.verifyToken(token, phone, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Endpoints.USERS, phone, (err, data) => {
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
            // Error if nothing is sent to update
            if(firstName || lastName || password){
                let token = StringUtils.isValidString(data.headers.token);
                Validator.verifyToken(token, phone, (isValidToken) => {
                    if(isValidToken){
                        FsHelper.read(Endpoints.USERS, phone, (err, userData) => {
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
                                FsHelper.update(Endpoints.USERS, phone, userData, (err) => {
                                    if(!err){
                                        callback(200, {Success : DisplayText.SUCCESS_USER_UPDATED});
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
        let phone = StringUtils.isValidStringPhoneNumber(data.payload.phone);
        if(phone){
            let token = StringUtils.isValidString(data.headers.token);
            Validator.verifyToken(token, phone, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Endpoints.USERS, phone, (err, userData) => {
                        if(!err && userData){
                            FsHelper.delete(Endpoints.USERS, phone, (err) => {
                                if(!err){
                                    // Delete each of the checks associated with the user
                                    let userChecks = StringUtils.isUserChecks(userData.checks);
                                    if(ArrayUtils.isNotEmptyArray(userChecks)){
                                        let checksDeleted = 0;
                                        let hasDeletionErrors = false;
                                        userChecks.forEach((checkId) => {
                                            FsHelper.delete(Endpoints.CHECKS, checkId, (err) => {
                                                if(err){
                                                    hasDeletionErrors = true;
                                                }
                                                checksDeleted++;
                                                if(checksDeleted == userChecks.length){
                                                    if(!hasDeletionErrors){
                                                        callback(200);
                                                    } else {
                                                        callback(500, {Error : DisplayText.ERRORS_ENCOUNTERED_DELETE_CHECKS});
                                                    }
                                                }
                                            })
                                        })
                                    } else {
                                        callback(200);
                                    }
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
            FsHelper.read(Endpoints.USERS, phone, (err, userData) => {
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

                        FsHelper.create(Endpoints.TOKENS, tokenId, tokenObj, (err) => {
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
            FsHelper.read(Endpoints.TOKENS, id, (err, tokenData) => {
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
            FsHelper.read(Endpoints.TOKENS, id, (err, tokenData) => {
                if(!err && tokenData){
                    // Check make sure the token isn't already expired
                    if(tokenData.expires > Date.now()){
                        tokenData.expires = Date.now() + 1000 * 60 * 60;
                        FsHelper.update(Endpoints.TOKENS, id, tokenData, (err) => {
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
            FsHelper.read(Endpoints.TOKENS, id, (err, data) => {
                if(!err && data){
                    FsHelper.delete(Endpoints.TOKENS, id, (err) => {
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {Error : DisplayText.CANNOT_FIND_TOKEN})
                        }
                    })
                }else {
                    callback(400, {Error : DisplayText.CANNOT_FIND_TOKEN});
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    }
}

const ChecksCrud = {
    // Require data: protocol, url, method, successCodes, timeoutSeconds
    // Optional data: none
    post : (data, callback) => {
        // Validate inputs
        let protocol = StringUtils.isValidProtocol(data.payload.protocol);
        let url = StringUtils.isValidString(data.payload.url);
        let method = StringUtils.isValidMethod(data.payload.method);
        let successCodes = StringUtils.isSuccessCodes(data.payload.successCodes);
        let timeoutSeconds = StringUtils.isValidTimeoutSeconds(data.payload.timeoutSeconds);
        if(protocol && url && method && successCodes && timeoutSeconds){
            // Get then token from the headers
            let token = StringUtils.isValidString(data.headers.token);
            FsHelper.read(Endpoints.TOKENS, token, (err, tokenData) => {
                if(!err && tokenData){
                    let phone = tokenData.phone;
                    FsHelper.read(Endpoints.USERS, phone, (err, userData) => {
                        if(!err && userData){
                            let userChecks = StringUtils.isUserChecks(userData.checks);
                            // Verify that the user has less than the number of max checks per user
                            if(userChecks.length < Config.maxChecks){
                                // Create a random id for check
                                let checkId = CryptoUtils.createRandomString(20);

                                // Create the check object, and inckude the user's name
                                let checkObj = {
                                    'id' : checkId,
                                    'userPhone' : phone,
                                    'protocol' : protocol,
                                    'url' : url,
                                    'method' : method,
                                    'successCodes' : successCodes,
                                    'timeoutSeconds' :timeoutSeconds
                                };

                                // Save the object
                                FsHelper.create(Endpoints.CHECKS, checkId, checkObj, (err) => {
                                    if(!err){
                                        // Add the check id to the user's object
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);
                                        FsHelper.update(Endpoints.USERS, phone, userData, (err) => {
                                            if(!err){
                                                callback(200, checkObj);
                                            } else {
                                                callback(500, {Error : DisplayText.CANNOT_UPDATE_USER_WITH_NEW_CHECK});
                                            }
                                        })
                                    
                                    } else {
                                        callback(500, {Error : DisplayText.CANNOT_CREATE_CHECK});
                                    }
                                })

                            } else {
                                callback(400, {Error : `The user already has the maximum number of checks (${Config.maxChecks})`});
                            }
                        } else {
                            // Not authorized
                            callback(403);
                        }
                    })
                } else {
                    // Not authorized
                    callback(403);
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_INPUTS});
        }
    },
    // Require data: id
    // Optional data: none
    get : (data, callback) => {
        let id = StringUtils.isValidString(data.queryString.id);
        if(id){
            FsHelper.read(Endpoints.CHECKS, id, (err, checkData) => {
                if(!err && checkData){
                    let token = StringUtils.isValidString(data.headers.token);
                    // Verify that the given token s valid and belongs to the user who created the check
                    Validator.verifyToken(token, checkData.userPhone, (isValidToken) => {

                        if(isValidToken){
                            callback(200, checkData);
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    },
    // Require data: id
    // Optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
    put : (data, callback) => {
        let id = StringUtils.isValidString(data.payload.displayId);
        if(id) {
            // Check for optional fields
            let protocol = StringUtils.isValidProtocol(data.payload.protocol);
            let url = StringUtils.isValidString(data.payload.url);
            let method = StringUtils.isValidMethod(data.payload.method);
            let successCodes = StringUtils.isSuccessCodes(data.payload.successCodes);
            let timeoutSeconds = StringUtils.isValidTimeoutSeconds(data.payload.timeoutSeconds);
            if(protocol || url || method || successCodes || timeoutSeconds){
                FsHelper.read(Endpoints.CHECKS, id, (err, checkData) => {
                    if(!err && checkData){
                        let token = StringUtils.isValidString(data.headers.token);
                        // Verify that the given token s valid and belongs to the user who created the check
                        Validator.verifyToken(token, checkData.userPhone, (isValidToken) => {
                            if(isValidToken){
                                // Update the check where necessary
                                if(protocol){
                                    checkData.protocol = protocol;
                                }
                                if(url){
                                    checkData.url = url;
                                }
                                if(method){
                                    checkData.method = method;
                                }
                                if(successCodes){
                                    checkData.successCodes = successCodes;
                                }
                                if(timeoutSeconds){
                                    checkData.timeoutSeconds = timeoutSeconds;
                                }
                                FsHelper.update(Endpoints.CHECKS, id, checkData, (err) => {
                                    if(!err){
                                        callback(200, {Success : DisplayText.SUCCESS_CHECK_UPDATED});
                                    } else {
                                        callback(500, {Error: DisplayText.CANNOT_UPDATE_CHECK});
                                    }
                                })
                            } else {
                                callback(403);
                            }
                        });
                    } else {
                        callback(400, {Error : DisplayText.CHECK_ID_DOES_NOT_EXIST});
                    }
                })
            } else {
                callback(400, {Error : DisplayText.MISSING_FIELDS_TO_UPDATE})
            }

        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    },
    // Require data: id
    // Optional data: none
    delete : (data, callback) => {
        let id = StringUtils.isValidString(data.payload.uid);
        if(id) {
            FsHelper.read(Endpoints.CHECKS, id, (err, checkData) => {
                if(!err && checkData){
                    let token = StringUtils.isValidString(data.headers.token);          
                    Validator.verifyToken(token, checkData.userPhone, (isValidToken) => {
                        if(isValidToken){
                            FsHelper.delete(Endpoints.CHECKS, id, (err) => {
                                if(!err){
                                    FsHelper.read(Endpoints.USERS, checkData.userPhone, (err, userData) => {
                                        let userChecks = StringUtils.isUserChecks(userData.checks);
                                        if(userChecks.includes(id)){
                                            userData.checks = userChecks.filter((checkId) => {
                                                if( checkId != id) { return true;}
                                            });
                                            FsHelper.update(Endpoints.USERS, checkData.userPhone, userData, (err) => {
                                                if(!err){
                                                    callback(200, {Success : DisplayText.SUCCESS_CHECK_DELETED});
                                                } else {
                                                    callback(500, {Error : DisplayText.CANNOT_UPDATE_USER})
                                                }
                                            })
                                        } else {
                                            callback(500, {Error : DisplayText.CANNOT_DELETE_CHECK});
                                        }
                                    });
                                } else {
                                    callback(500, {Error : DisplayText.CANNOT_DELETE_CHECKFsHelper});
                                }
                            })
                        } else {
                            callback(403, {Error : DisplayText.ERROR_INVALID_TOKEN});
                        }
                    });
                } else {
                    callback(400, {Error : DisplayText.CHECK_ID_DOES_NOT_EXIST})
                }
            })
        } else {
            callback(400, {Error : DisplayText.MISSING_REQUIRED_FIELD})
        }
    }
}

const Validator = {
    verifyToken : (id, phone, callback) => {
        FsHelper.read(Endpoints.TOKENS, id, (err, tokenData) => {
            if(!err && tokenData){
                if(tokenData.phone == phone && tokenData.expires > Date.now()){
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