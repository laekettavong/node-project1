/*
* Primary file for API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare the app
let app = {
    init : (callback) => {
        // If we'er on the master thread, start the worker as the CLI
        if(cluster.isMaster) {
            workers.init();

            // Start te CLI, but make sure it starts last
            setTimeout(() => {
                cli.init();
                callback();
            }, 50);
    
            // Fork the process...manually
            for(let i = 0; i < os.cpus().length; i++) {
                cluster.fork();
            }

        } else {
            // If we're not on the master thread, staert the HTTP server
            server.init();
        }

    }
}

// Self invoking only if required directly...invoked from command line to start app
// app.init() would not be invoke if implicitly required from a separate file - i.e. from a test suite
if(require.main === module) { 
    app.init(() => {}); // passin No-OP callback
}

// Export the app
module.exports = app;

