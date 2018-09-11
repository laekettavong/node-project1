/*
* Example of REPL Server
* Take in the word "fizz" and log out "buzz"
*/

// Dependencies
const repl = require('repl');

// Start the REPL
repl.start({
    'prompt': '>',
    'eval' : (str) => {
        // Evaluation functon for incoming iputs
        console.log('At the evaluation stage: ', str);
        if(str.indexOf('fizz') > -1) {
            console.log('buzz');
        }
    }
})