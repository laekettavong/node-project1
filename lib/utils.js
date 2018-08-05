const crypto = require('crypto');
const config = require('./config');

const utils = {
    string : {
        isValidString : (str) => {
            return typeof(str) == 'string' && str.trim().length > 0 ? str : false;
        },
        isValidBoolean : (bool) => {
            return typeof(bool) == 'boolean' && bool ? bool : false;
        },
        isValidStringPhoneNumber : (numStr) => {
            return typeof(numStr) == 'string' && numStr.trim().length == 10 ? numStr : false;
        }
    },
    crypto : {
        hash : (str) => {
            if(utils.string.isValidString(str)){
                return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
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
                //console.log("Error while parsing JSON to object", err)
                return {};
            }
        }
    }
}

module.exports = utils;