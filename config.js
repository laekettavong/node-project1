/*
*   Create and export configuration variables
*/

// Container for all the environments
const environments = {
    staging : {
        httpPort : 3000,
        httpsPort : 3001,
        envName : 'staging'
    },
    production : {
        httpPort : 5000,
        httpsPort : 5001,
        envName : 'production'
    },
};

// Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check tghat the current environment is one of the environments abovem if not, default to staging
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = envToExport;