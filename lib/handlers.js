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
        get : (data, callback) => {

        },
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
                                password : hashedPassword,
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
        put : (data, callback) => {
            
        },
        delete : (data, callback) => {
            
        }
    }
}

module.exports = handlers;