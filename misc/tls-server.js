/*
* Example TLS Server
* Listens to port 6000 and sends the word 'pong' to client
*/


// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
let options = {
    // below two .pem files were generated using oopenssl as follows
    'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

// Craete the server
const server = tls.createServer(options, (connection) => {
    // send the word "pong"
    let outBoundMessage = 'pong';
    connection.write(outBoundMessage);

    // When the client writes something, log it out
    connection.on('data', (inboundMessage) => {
        let messageString = inboundMessage.toString();
        console.log(`I wrote ${outBoundMessage} and they said ${messageString}`);
    })
});

server.listen(6000);