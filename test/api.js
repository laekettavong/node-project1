/*
* API Tests
*/

// Depenendcies
const app = require('./../index');
const assert = require('assert');
const http = require('http');
const config = require('./../lib/config');

// Holder for the tests
const api = {};

// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = (done) => {
    assert.doesNotThrow(() => {
        app.init((err) => {
            done();
        });
    }, TypeError);
}


// Make a request to /ping
api['/ping should respond to GET with 200'] = (done) => {
    ApiHelper.makeGetRequest('/ping', (res) => {
        assert.equal(res.statusCode, 200);
        done();
    });
}

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = (done) => {
    ApiHelper.makeGetRequest('/api/users', (res) => {
        assert.equal(res.statusCode, 400);
        done();
    });
}

// Make a request to a random path
api['A random path should respond to GET with 404'] = (done) => {
    ApiHelper.makeGetRequest('/this/path/shouldnt/exist', (res) => {
        assert.equal(res.statusCode, 404);
        done();
    });
}


const ApiHelper = class ApiHelper {
    static makeGetRequest(path, callback) {
        // Configure the request details
        let requestDetails = {
            'protocol' : 'http:',
            'hostname' : 'localhost',
            'port' : config.httpPort,
            'method' : 'GET',
            'path' : path,
            'headers' : {
                'Content-Type' : 'application/json'
            }
        };

        // Send request
        let req = http.request(requestDetails, (res) => {
            callback(res);
        });
        req.end()
    }
}

module.exports = api;