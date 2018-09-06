/*
* Primary file for API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
let app = {
    init : () => {
        server.init();
        workers.init();

        // Start te CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
        }, 50);
    }
}

app.init();

// Export the app
module.exports = app;

