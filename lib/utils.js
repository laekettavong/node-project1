const crypto = require('crypto');
const config = require('./config');
const Constants = require('./constants');
const ArrayConstants = Constants.Arrays;
const Utils = {
    string : {
        isValidString(str) {
            //return typeof(str) == 'string' && str.trim().length > 0 ? str : false;
            return this.isTypeOfString(str) && str.trim().length > 0 ? str : false;
        },
        isValidBoolean(bool) {
            // return typeof(bool) == 'boolean' && bool ? bool : false;
            return isTypeOfBoolean(bool) && bool ? bool : false;
        },
        isValidStringPhoneNumber(numStr) {
            //return typeof(numStr) == 'string' && numStr.trim().length == 10 ? numStr : false;
            return this.isTypeOfString(numStr) && numStr.trim().length == 10 ? numStr : false;
        },
        isValidNumber(num) {
            //return typeof(num) == 'number' && num > 0 ? num : false;
            return this.isTypeOfNumber(num) && num > 0 ? num : false;
        },
        isValidProtocol(protocol) {
            //return typeof(protocol) == 'string' && ['https', 'http'].includes(protocol.toLowerCase()) ? protocol : falseß;
            return this.isTypeOfString(protocol) && ArrayConstants.acceptableProtocols.includes(protocol.toLowerCase()) ? protocol : false;
        },
        isAcceptableMethod(method) {
            //return typeof(method) == 'string' && ['get', 'post', 'put', 'delete'].includes(method.toLowerCase());
            return this.isTypeOfString(method) && ArrayConstants.acceptableMethods.includes(method.toLowerCase());
        },
        isSuccessCodes(successCodes) {
            //return typeof(successCodes) == 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
            return this.isTypeOfObject(successCodes) && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
        },
        isValidTimeoutSeconds(seconds) {
            //return typeof(seconds) == 'number' && seconds % 1 === 0 && seconds >= 1 && seconds <= 5 ? seconds : false;
            return this.isTypeOfNumber(seconds) && seconds % 1 === 0 && seconds >= 1 && seconds <= 5 ? seconds : false;
        },
        isUserChecks(checks) {
            //return typeof(checks) == 'object' && checks instanceof Array ? checks : [];
            return this.isTypeOfObject(checks) && checks instanceof Array ? checks : [];
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
        }
    },
    array : {
        isNotEmptyArray(array) {
            return typeof(array) == 'object' && array instanceof Array && array.length > 0 ? array : false;
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
    }
}

module.exports = Utils;