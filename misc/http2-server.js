/*
* Example HTTP2 Server
*/

// Dependencies
let http2 = require('http2');

// Init the server
let server = http2.createServer();

// On a stream, asend back hello world HTML
server.on('stream', (stream, headers) => {
    stream.respond({
        'status' : 200,
        'content-type' : 'text/html'
    });
    stream.end('<html><body><p>Hello World</p></body></html>');
});

// Listen on port 6000
server.listen(6000);