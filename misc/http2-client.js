/*
* Example HTTP2 client
*/

// Dependencies
let http2 = require('http2');

// Create client
let client = http2.connect('http://localhost:6000');

// Create a rewues
let req = client.request({
    'path' : '/'
});

// When a messeage is received, add the pieces of it together until you reach the end
let str = '';
req.on('data', (chunk) => {
    str += chunk;
});

req.on('end', () => {
    console.log(str);
});

// End the request
req.end();