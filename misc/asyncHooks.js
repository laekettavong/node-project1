/*
* Async Hook Example
*/

// Dependencies
const async_hooks = require('async_hooks');
const fs = require('fs');

// Write an arbitrary aysc function
let whatTimeIsIt = (callback) => {
    setInterval(() => {
        fs.writeSync(1, `When the setIntval function runs, the execution context is ${async_hooks.executionAsyncId()} \n`);
        callback(Date.now());
    }, 1000);
};

// Call that function
whatTimeIsIt((time) => {
    fs.writeSync(1, `The time is ${time} \n`);
});

// Deine the async hooks
let hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, `Hook init ${asyncId} \n`);
    },
    before(asyncId) {
        fs.writeSync(1, `Hook before ${asyncId} \n`);
    },
    after(asyncId) {
        fs.writeSync(1, `Hook after ${asyncId} \n`);
    },
    destroy(asyncId) {
        fs.writeSync(1, `Hook destroy ${asyncId} \n`);
    },
    promiseResolve(asyncId) {
        fs.writeSync(1, `Hook promiseResolve ${asyncId} \n`);
    }
};

// Create a new AysncHooks instance
let asyncHooks = async_hooks.createHook(hooks);
asyncHooks.enable();