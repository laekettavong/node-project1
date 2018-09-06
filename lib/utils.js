const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const Constants = require('./constants');
//const Utils = require('./utils');
const ArrayConstants = Constants.Arrays;
const DisplayText = Constants.DisplayText;
//const StringUtils = Utils.string;

const Utils = {
    string : {
        isValidString(str, maxLength) {
            if(maxLength){
                return this.isTypeOfString(str) && str.trim().length > 0 && str.trim().length <= maxLength ? str.trim() : false; 
            } else {
                return this.isTypeOfString(str) && str.trim().length > 0 ? str.trim() : false;
            }
        },
        isValidStringDefaultToEmpty(str) {
            return this.isTypeOfString(str) && str.trim().length > 0 ? str.trim() : '';
        },
        isValidPath(path) {
            return this.isTypeOfString(path) && path.trim().length > 0 ? path : '/';
        },
        isValidBoolean(bool) {
            return this.isTypeOfBoolean(bool) && bool ? bool : false;
        },
        isValidStringPhoneNumber(numStr) {
            return this.isTypeOfString(numStr) && numStr.trim().length == 10 ? numStr : false;
        },
        isValidNumber(num, defaultVal) {
            if(defaultVal) {
                return this.isTypeOfNumber(num) && this.isTypeOfNumber(defaultVal) && num > 0 ? num : defaultVal;
            }
            return this.isTypeOfNumber(num) && num > 0 ? num : false;
        },
        isValidProtocol(protocol) {
            return this.isTypeOfString(protocol) && ArrayConstants.acceptableProtocols.includes(protocol.toLowerCase()) ? protocol : false;
        },
        isValidMethod(method) {
            return this.isTypeOfString(method) && ArrayConstants.acceptableMethods.includes(method.toLowerCase()) ? method : false;
        },
        isAcceptableState(state, defaultVal) {
            if(defaultVal) {
                return this.isTypeOfString(state) && ArrayConstants.acceptableStates.includes(state.toLowerCase()) ? state : defaultVal;
            }
            return this.isTypeOfString(state) && ArrayConstants.acceptableStates.includes(state.toLowerCase()) ? state : 'down';
        },
        isSuccessCodes(successCodes) {
            return this.isTypeOfObject(successCodes) && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
        },
        isValidTimeoutSeconds(seconds) {
            return this.isTypeOfNumber(seconds) && seconds % 1 === 0 && seconds >= 1 && seconds <= 5 ? seconds : false;
        },
        isUserChecks(checks) {
            return this.isTypeOfObject(checks) && checks instanceof Array ? checks : [];
        },
        isValidCheckData(checkData) {
            return this.isValidObject(checkData);
        },
        isValidObject(obj) {
            return this.isTypeOfObject(obj) && obj !== null ? obj : {};
        },
        isValidFunction(funct) {
            return this.isTypeOfFunction(funct) ? funct : false;
        },
        isValidCheckDataId(id) {
            return this.isTypeOfString(id) && id.trim().length == 20 ? id.trim() : false;
        },
        isTypeOfString(dataType) {
            return typeof(dataType) == 'string';
        },
        isTypeOfNumber(dataType) {
            return typeof(dataType) == 'number';
        },
        isTypeOfBoolean(dataType) {
            return typeof(dataType) == 'boolean';
        },
        isTypeOfObject(dataType) {
            return typeof(dataType) == 'object';
        },
        isTypeOfFunction(dataType) {
            return typeof(dataType) == 'function';
        }
    },
    array : {
        isNotEmptyArray : (array) => {
            return typeof(array) == 'object' && array instanceof Array && array.length > 0 ? array : false;
        },
        spliceStringFromElements : (targetArray, stringToRemove) => {
            let retArray = [];
            targetArray.forEach((elem) => {
                retArray.push(elem.replace(stringToRemove, ''));
            })
            return retArray;
        },
        size : (array) => {
            
            return Utils.string.isTypeOfObject(array) && array instanceof Array && array.length > 0 ? array.length : 0;
        }
    },
    crypto : {
        hash : (str) => {
            if(Utils.string.isValidString(str)){
                return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
            } else {
                return false;
            }
        },
        isAuthenticated : (incomingPassword, storedPassword) => {
            if(Utils.string.isValidString(incomingPassword)
            && Utils.string.isValidString(storedPassword)){
                return incomingPassword == storedPassword;
            } else {
                return false;
            }
        },
        // Create a string of random alphanumeric characters of a given length
        createRandomString : (strLength) => {
            if(Utils.string.isValidNumber(strLength)){
                // Define a the possible characters that could go into a string
                let allCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
                let randomStr = '';
                let counter = 0;
                while(counter < strLength){
                    randomStr += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
                    counter++;
                }
                return randomStr;
            } else {
                return false;
            }
        }
    },
    parser : {
        parseJsonToObject : (str) => {
            try {
                return JSON.parse(str);
            } catch(err) {
                return {};
            }
        }
    },
    twilio : {
        sendSms : (phone, msg, callback) => {
            phone = Utils.string.isValidStringPhoneNumber(phone);
            msg = Utils.string.isValidString(msg, 1600);
            if(phone && msg){
                // Configure the request payload
                let payload = {
                    'From' : config.twilio.fromPhone,
                    'To' : `+${phone}`,
                    'Body' : msg
                }

                let stringPayload = querystring.stringify(payload);
                let requestDetails = {
                    'protocol' : 'https:',
                    'hostname' : 'api.twilio.com',
                    'method' : 'POST',
                    'path' : `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
                    'auth' : `${config.twilio.accountSid}:${config.twilio.authToken}`,
                    'headers' : {
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Conent-Length' : Buffer.byteLength(stringPayload)
                    }
                }

                // Instantiate the request object
                let req = https.request(requestDetails, (res) => {
                    let status = res.statusCode;
                    if(status == 200 || status == 201){
                        callback(false); 
                    } else {
                        callback(`Status code was ${status}`);
                    }
                });

                // Bind to the error event so it doesn;t get thrown
                req.on('error', (err) => {
                    callback(err);
                })
                req.write(stringPayload);
                req.end();
            } else {
                callback(400, {Error : DisplayText.MISSING_INVALID_REQUIRED_FIELDS});
            }
        }
    }
}

module.exports = Utils;