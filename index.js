/*
* Primary file for API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
let app = {
    init : (callback) => {
        server.init();
        workers.init();

        // Start te CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
            callback();
        }, 50);
    }
}

// Self invoking only if required directly...invoked from command line to start app
// app.init() would not be invoke if implicitly required from a separate file - i.e. from a test suite
if(require.main === module) { 
    app.init(() => {}); // passin No-OP callback
}

// Export the app
module.exports = app;

