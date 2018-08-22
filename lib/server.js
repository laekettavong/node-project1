/*
* Server-related tasks
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('util');
const debug = util.debuglog('servers');
const StringDecoder = require('string_decoder').StringDecoder;
const Config = require ('./config');
const Handlers = require('./handlers');
const Utils = require('./utils');
const Parser = Utils.parser;
const Colors = require('./constants').ConsoleColors;

const httpsServerOptions = {
    // below two .pem files were generated using oopenssl as follows
    key : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

// Instantiate te server module object
const server = {
    init : () => {
            server.httpServer.listen(Config.httpPort, () => {
                console.log(Colors.LIGHT_BLUE, `The server is listening on port ${Config.httpPort}`);
            });

            server.httpsServer.listen(Config.httpsPort, () => {
                console.log(Colors.MAGENTA, `The server is listening on port ${Config.httpsPort}`);
            });
    },
    router : {
        '' : Handlers.index,
        'account/create' : Handlers.accountCreate,
        'account/edit' : Handlers.accountEdit,
        'account/deleted' : Handlers.accountDeleted,
        'session/create' : Handlers.sessionCreate,
        'session/deleted' : Handlers.sessionDeleted,
        'checks/all' : Handlers.checksList,
        'checks/create' : Handlers.checksCreate,
        'checks/edit' : Handlers.checksEdit,
        'ping' : Handlers.ping,
        'api/users' : Handlers.users,
        'api/tokens' : Handlers.tokens,
        'api/checks' : Handlers.checks,
        'favicon.ico' : Handlers.favicon,
        'public' : Handlers.public
    
    },
    httpServer : http.createServer((req, res) => {
        server.unifiedServer(req, res); 
    }),
    httpsServer : https.createServer(httpsServerOptions, (req, res) => {
        server.unifiedServer(req, res); 
    }),
    unifiedServer : (req, res) => {
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
            let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : Handlers.notFound;

            // If the request is within the public directory, us the public handler instead
            chosenHandler = trimmedPath.indexOf('public/') > -1 ? Handlers.public : chosenHandler;

            // Construct the data object to sent to handler
            let data = {
                    'trimmedPath' : trimmedPath,
                    'queryString' : queryString,
                    'headers' : headers,
                    'method' : method,
                    'payload' : Parser.parseJsonToObject(buffer)
            };
    
            // Route the request to the handler specified in the rounter
            chosenHandler(data, (statusCode, payload, contentType) => {
                // Use the status code called back by the handler, or default to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    
                // Detemerine the type of response (fallback to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                // Return the response parts that are content-specific
                let payloadString = '';
                if(contentType == 'json') {
                    res.setHeader('Content-Type', 'application/json');
                    payload = typeof(payload) == 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                }

                if(contentType == 'html'){
                    res.setHeader('Content-Type', 'text/html');
                    payloadString = typeof(payload) == 'string'? payload : '';
                  }
         
                  if(contentType == 'favicon'){
                    res.setHeader('Content-Type', 'image/x-icon');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'plain'){
                    res.setHeader('Content-Type', 'text/plain');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'css'){
                    res.setHeader('Content-Type', 'text/css');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'png'){
                    res.setHeader('Content-Type', 'image/png');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'jpg'){
                    res.setHeader('Content-Type', 'image/jpeg');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  // Return the response-parts common to all content-types
                  res.writeHead(statusCode);
                  res.end(payloadString);

                // If the response is 200, print green otherwise print red
                if(statusCode == 200){
                    debug(Colors.GREEN, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                } else {
                    debug(Colors.RED, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                }
                //debug('Returning this response: ', statusCode, payloadString);
            });
    
        });
    }
};


// Export the moduke
module.exports = server;

/*
// Testing
// @TODO delete this
const _data = require('./lib/data');
const TwilioUtil = Utils.twilio;

_data.create('test', 'newFile', {foo : 'bar'}, (err) => {
    debug('This was the error: ', err);
});

_data.read('test', 'newFile', (err, data) => {
    debug('This was the error: ', err, ' and this was the data: ', data);
});


_data.update('test', 'newFile', {fizz : 'buzz'}, (err) => {
    debug('This was the error: ', err);
});

_data.delete('test', 'newFile', (err) => {
    debug('This was the error: ', err);
});



TwilioUtil.sendSms('4151234567', 'Hello there!', (err) => {
    debug('This was the error', err);
})
*/
