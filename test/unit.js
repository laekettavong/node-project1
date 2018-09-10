
/*
* Unit Tests
*/

const Utils = require('./../lib/utils');
const NumberUtils = Utils.number;
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

// Holders for tests

const unit = {};

// Assert that getANumber function is returning a number
unit['NumberUtils.getANumber should return number'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(typeof(val), 'number');
    done();
}

// Assert that getANumber function is returning a 1
unit['NumberUtils.getANumber should return 1'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(val, 1);
    done();
}

// Assert that getANumber function is returning a 2
unit['NumberUtils.getANumber should return 2'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(val, 2);
    done();
}

// Log.list should cllback an array and a false error
unit['log.list should callback a false error and an array of log names'] = (done) => {
    logs.list(true, (err, logFileNames) => {
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
}

// Logs.truncate should not throw if the logId doesn't exists
unit['log.truncate should not throw if the logId does not exists. It should callback an error instead'] = (done) => {
    assert.doesNotThrow(() => {
        logs.truncate('I do not exist', (err) => {
            assert.ok(err);
            done();
        });
    }, TypeError);
}

// exampleDebuggingProblem should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = (done) => {
    assert.doesNotThrow(() => {
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
}

// Export the tests to the runner
module.exports = unit;