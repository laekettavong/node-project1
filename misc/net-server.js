/*
* Example UTCP (Net) Server
* Listens to port 6000 and sends the word 'pong' to client
*/


// Dependencies
const net = require('net');

// Craete the server
const server = net.createServer((connection) => {
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