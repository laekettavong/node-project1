/*
* Test runner
*/

const Constants = require('./../lib/constants');
const Colors = Constants.ConsoleColors;

// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Application logic for the rest runner
const _app = {
    tests : { 
        unit : require('./unit'),
        api : require('./api')
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
        process.exit(0);
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


// Run the test
_app.runTests();