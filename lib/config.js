/*
*   Create and export configuration variables
*/

// Container for all the environments
const environments = {
    staging : {
        httpPort : 3000,
        httpsPort : 3001,
        envName : 'staging',
        hashingSecret : 'thisIsASecret',
        maxChecks : 5,
        workersIntervalSeconds : 60,
        twilio : {
            accountSid : 'ACb32d411ad7fe886aac54c665d25e5c5d',
            authToken : '9455e3eb3109edc12e3d8c92768f7a67',
            fromPhone : '+15005550006'
        },
        templateGlobals : {
            appName : 'UptimeChecker',
            companyName : 'NotARealCompany, Inc.',
            yearCreated : '2018',
            baseUrl : 'http://localhost:3000/'

        }

    },
    production : {
        httpPort : 5000,
        httpsPort : 5001,
        envName : 'production',
        hashingSecret : 'thisIsASecret',
        maxChecks : 5,
        workersIntervalSeconds : 60,
        twilio : {
            accountSid : '',
            authToken : '',
            fromPhone : ''
        },
        templateGlobals : {
            appName : 'UptimeChecker',
            companyName : 'NotARealCompany, Inc.',
            yearCreated : '2018',
            baseUrl : 'http://localhost:5000/'

        }
    }
};

// Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check tghat the current environment is one of the environments abovem if not, default to staging
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = envToExport;