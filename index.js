/*
* Primary file for API
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const Config = require ('./lib/config');
const Handlers = require('./lib/handlers');
//const Utils = require('./lib/utils');
const Parser = require('./lib/utils').parser;

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res); 
});

// Start the HTTP server
httpServer.listen(Config.httpPort, () => {
    console.log(`The server is listening on port ${Config.httpPort}`);
});

const httpsServerOptions = {
    // below two .pem files were generated using oopenssl as follows
    key : fs.readFileSync('./https/key.pem'),
    cert : fs.readFileSync('./https/cert.pem')
};

// Instatiate the HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res); 
});

// Start the HTTPS server
httpsServer.listen(Config.httpsPort, () => {
    console.log(`The server is listening on port ${Config.httpsPort}`);
});

// All the server logic for both HTTP and HTTPS server
const unifiedServer = (req, res) => {
    // Get thge URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path from the URL
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    let queryString = parsedUrl.query;

    // The get teh HTTP Method
    let method = req.method.toUpperCase();

    // Get the headers a an object
    let headers = req.headers;

    // Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        // Choose the handler this request should go to. If one is not found, use the notFound handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : Handlers.notFound;

        // Construct the data object to senbt to handler
        let data = {
                'trimmedPath' : trimmedPath,
                'queryString' : queryString,
                'headers' : headers,
                'method' : method,
                'payload' : Parser.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the rounter
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or defult to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);
        });

    });
 
};

// Define a request router
const router = {
    'ping' : Handlers.ping,
    'users' : Handlers.users,
    'tokens' : Handlers.tokens,
    'checks' : Handlers.checks

};

// Testing
// @TODO delete this
//const _data = require('./lib/data');

// _data.create('test', 'newFile', {foo : 'bar'}, (err) => {
//     console.log('This was the error: ', err);
// });

// _data.read('test', 'newFile', (err, data) => {
//     console.log('This was the error: ', err, ' and this was the data: ', data);
// });


// _data.update('test', 'newFile', {fizz : 'buzz'}, (err) => {
//     console.log('This was the error: ', err);
// });

// _data.delete('test', 'newFile', (err) => {
//     console.log('This was the error: ', err);
// });