/*
* Primary file for API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
let app = {
    init : () => {
        server.init();
        workers.init();
    }
}

app.init();

// Export the app
module.exports = app;

