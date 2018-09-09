/*
* Test runner
*/

const Utils = require('./../lib/utils');
const NumberUtils = Utils.number;
const Constants = require('./../lib/constants');
const Colors = Constants.ConsoleColors;
const assert = require('assert');

// Application logic for the rest runner

const _app = {
    tests : { 
        unit : {},
    },

    // Count all the tests
    countTests : () => {
        let counter = 0;
        for(let key in _app.tests){
            if(_app.tests.hasOwnProperty(key)) {
                let subTests = _app.tests[key];
                for(let testName in subTests) {
                    if(subTests.hasOwnProperty(testName)) {
                        counter++;
                    }
                }
            }
        }
        return counter;
    },

    // Produce a test outcome report
    produceTestReport : (limit, successes, errors) => {
        console.log('');
        console.log(`----------\x1b[33mBEGIN TEST REPORT\x1b[0m----------`); 
        console.log('');
        console.log('Total Tests: ', limit);
        console.log('Pass: ', successes);
        console.log('Failed: ', errors.length);
        console.log('');
        // If there are errors, print them in detail
        if(errors.length > 0) {
            console.log('----------BEGIN ERROR DETAILS----------');
            console.log('');
            errors.forEach((testError) => {
                console.log(Colors.RED, testError.name);
                console.log(testError.error);
                console.log('');

            });
            console.log('');
            console.log('----------END ERROR DETAILS----------');
        }
        console.log('');
        console.log(`----------\x1b[33mEND TEST REPORT\x1b[0m----------`); 
    },

    // Run all the tests, collecting the errors and successes
    runTests : () => {
        let errors = [];
        let successes = 0;
        let limit = _app.countTests();
        let counter = 0;
        for(let key in _app.tests) {
            if(_app.tests.hasOwnProperty(key)) {
                let subTests = _app.tests[key];
                for(let testName in subTests) {
                    if(subTests.hasOwnProperty(testName)) {
                        (() => {
                            let tmpTestName = testName;
                            let testValue = subTests[testName]

                            // Call the test
                            try {
                                testValue(() => {
                                    // If it calls back withoput throwing, then it succeeded, so log it in green
                                    console.log(Colors.GREEN, tmpTestName);
                                    counter++;
                                    successes++;
                                    if(counter == limit) {
                                        _app.produceTestReport(limit, successes, errors);
                                    }
                                })
                            } catch(err) {
                                // If it throws, then it failed, so capture the error throw and log it in red
                                errors.push({
                                    'name' : testName,
                                    'error' : err
                                });
                                console.log(Colors.RED, tmpTestName);
                                counter++;
                                if(counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            }
                        })();
                    }
                }
            }
        }
    }
}

// Assert that getANumber function is returning a number
_app.tests.unit['NumberUtils.getANumber should return number'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(typeof(val), 'number');
    done();
}

// Assert that getANumber function is returning a 1
_app.tests.unit['NumberUtils.getANumber should return 1'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(val, 1);
    done();
}

//Assert that getANumber function is returning a 2
_app.tests.unit['NumberUtils.getANumber should return 2'] = (done) => {
    let val = NumberUtils.getANumber();
    assert.equal(val, 2);
    done();
}


console.log("XXX", _app.tests.unit);

// Run the test
_app.runTests();