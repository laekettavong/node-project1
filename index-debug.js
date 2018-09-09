/*
* Primary file for API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const errorDebuggingPromblem = require('./lib/exampleDebuggingProblem');

// Declare the app
let app = {
    init : () => {
        debugger;
        server.init();
        debugger;
        workers.init();
        debugger;

        // Start te CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
        }, 50);

        debugger;



        let foo = 1;
        console.log('Just assign 1 to foo');
        debugger;
        foo++;
        console.log('Just incremented foo');
        debugger;
        foo = foo * foo;
        console.log('Just squared foo');
        debugger;
        foo = foo.toString();
        console.log('Just stringifized foo');
        debugger;
        // Invoke the init script that will throw 
        errorDebuggingPromblem.init();
        console.log('Just calle the library');
        debugger;
    }
}

app.init();

// Export the app
module.exports = app;

