/*
* Example TLS Client
* Connects to port 6000 and sends the word "ping" to the server
*/


// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
let options = {
    'ca' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem')) // Only required because we'er using self-signed certificate
}


// Define the message to send
let outboundMessage = 'ping';

const client = tls.connect(6000, options, () => {
    // Send the message
    client.write(outboundMessage);
});

// When the server writes back, log what it says then kill the client
client.on('data', (inboundMessage) => {
    let messageString = inboundMessage.toString();
    console.log(`I wrote ${outboundMessage} and they said ${messageString}`);
    client.end();
})
