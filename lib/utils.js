const crypto = require('crypto');
const config = require('./config');

const Utils = {
    string : {
        isValidString : (str) => {
            return typeof(str) == 'string' && str.trim().length > 0 ? str : false;
        },
        isValidBoolean : (bool) => {
            return typeof(bool) == 'boolean' && bool ? bool : false;
        },
        isValidStringPhoneNumber : (numStr) => {
            return typeof(numStr) == 'string' && numStr.trim().length == 10 ? numStr : false;
        },
        isValidNumber : (num) => {
            return typeof(num) == 'number' && num > 0 ? num : false;
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