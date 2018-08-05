/*
* Request handlers
*/

// Dependencies
const Utils = require('./utils');
const _data = require('./data');
const StringUtils = Utils.string;
const CryptoUtils = Utils.crypto;

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
            handlers.methods[data.method.toLowerCase()](data, callback);
            //handlers.methods.post(data, callback);
        } else {
            callback(405);
        }
    },
    // Not found handler
    notFound : (data, callback) => {
        callback(404);
    },
    // Containers for users submethods
    methods : {
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
                _data.read('/users', phone, (err, data) => {
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
                            _data.create('/users', phone, userObj, (err) => {
                                if(!err){
                                    callback(200);
                                } else {
                                    consoloe.log(err);
                                    callback(500, {Error: 'Could not create the new user'});
                                }
                            })
                        } else {
                            callback(500, {Error : 'Could not hash user\'s password'});
                        }
                    } else {
                        // USer already exists
                        callback(400, {Error : 'A user with that phone number already exists'})
                    }
                })
            } else {
                callback(400, {Error : 'Missing require fields'});
            }
            
        },
        // Require data: phone
        // Optional data: none
        // @TODO only let tan authenticated user access their object, don't let them access anyone else's
        get : (data, callback) => {
            // Check that thge phone is valid
            let phone = StringUtils.isValidStringPhoneNumber(data.queryString.phone);
            if(phone){
                _data.read('users', phone, (err, data) => {
                    if(!err && data){
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    }else {
                        callback(400);
                    }
                })
            } else {
                callback(400, {Error: 'Missing required field'})
            }

        },
        // Required data: phone
        // Optional data: firstName, lastName, password ( at least must be specified)
        // @TODO only let an authenticated user update their own object. Don;t let them update anyone else's
        put : (data, callback) => {
            // Check for the required field
            let phone = StringUtils.isValidStringPhoneNumber(data.payload.phone);
            // Check for optional fields
            let firstName = StringUtils.isValidString(data.payload.firstName);
            let lastName = StringUtils.isValidString(data.payload.lastName);
            let password = StringUtils.isValidString(data.payload.password);

            // Error if phone is invalid
            if(phone){
                // Error id nothing is sent to update
                if(firstName || lastName || password){

                _data.read('users', phone, (err, userData) => {
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
                        _data.update('users', phone, userData, (err) => {
                            if(!err){
                                callback(200);
                            } else {
                                consolog.log(err);
                                callback(500, {Error: 'Could not update the user'})
                            }
                        })
      
                    } else {
                        callback(400, {Error: 'The specified user does not exist'});
                    }
                })
                } else {
                    callback(400, {Error: 'Missing fields to update'});
                }
            } else {
                callback(400, {Error: 'Missing required field'})
            }

        },
        // Required data: phone
        // @TODO only let authenticated user delete their own object, don't let them delete anyone else's
        // @TODO cleanup (delete) any other data files associated with the user
        delete : (data, callback) => {
            let phone = StringUtils.isValidStringPhoneNumber(data.queryString.phone);
            if(phone){
                _data.read('users', phone, (err, data) => {
                    if(!err && data){
                        _data.delete('users', phone, (err) => {
                            if(!err){
                                callback(200);
                            } else {
                                callback(500, {Error: 'Could not find the specified user'})
                            }
                        })
                    }else {
                        callback(400, {Error: 'Could not find the specified user'});
                    }
                })
            } else {
                callback(400, {Error: 'Missing required field'})
            }
        }
    }
}

module.exports = handlers;