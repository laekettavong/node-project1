/*
* CLI-related tasks
*/

// Dependencies
const readline = require('readline');
const util = require('util');
const Utils = require('./utils');
const StringUtils = Utils.string;
const ArrayUtils = Utils.array;
const Parser = Utils.parser;
const debug = util.debuglog('cli');
const Colors = require('./constants').ConsoleColors;
const events = require('events');
class _event extends events{};
const e = new _event();
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const _logs = require('./logs');
const Constants = require('./constants');
const Endpoints = Constants.Endpoints;

// Instantiate the CLI module object
const cli = {
    init : () => {
        // Send the start message to the console. in dark blue
        console.log(Colors.DARK_BLUE, 'The CLI is running');

        // Start the interface
        let _interface = readline.createInterface({
            input : process.stdin,
            output : process.stdout,
            prompt : '> '
        });

        // Create an initial prompt
        _interface.prompt();

        // Handle each line of the input separately
        _interface.on('line', (str) => {
            // Send to the input processor
            cli.processInput(str);

            // Re-initialize the prompt fterwards
            _interface.prompt();
        });

        // If the user stops the CLI, kill the associated process
        _interface.on('close', (str) => {
            process.exit(0);
        });
    },
    processInput : (strUserInput) => {
        strUserInput = StringUtils.isValidString(strUserInput);

        // Only process the input if the user actually wrote something, other wise ignore it 
        if(strUserInput) {
            // Codify the unique strings that identify the unique questions allowed to be asked
            let uniqueInputs = [
                'man',
                'help',
                'exit',
                'stats',
                'list users',
                'more user info',
                'list checks',
                'more check info',
                'list logs',
                'more log info'
            ];

            // Go through the possible inputs, emit an event when a match is found
            let matchFound = false;
            let counter = 0;
            uniqueInputs.some((input) => {
                if(strUserInput.toLowerCase().indexOf(input) > -1){
                    matchFound = true;
                    // Emit an event matching the unique inout, and include the full string gicen by teh user
                    e.emit(input, strUserInput);
                    return true;
                }
            });

            // If no match is found, tell the user to try again
            if(!matchFound) {
                console.log('Sorry, try again');
            }

        }
    },
    horizontalLine : () => {
        // Get the available screen size
        let width = process.stdout.columns;
        let line = '';
        for(let i = 0; i < width; i++){
            line += '-';
        }
        console.log(line);
    },
    centered : (str) => {
        str = StringUtils.isValidStringDefaultToEmpty(str);
        // Get the available screen size
        let width = process.stdout.columns;

        // Calculate the keft padding there should be
        let leftPadding = Math.floor((width - str.length) / 2);

        // Put in left padded spae befoe he string itself
        let line = '';
        for(let i = 0; i < leftPadding; i++){
            line += ' ';
        }
        line += str;
        console.log(line);
    },
    verticalSpace : (lines) => {
        lines = StringUtils.isValidNumber(lines, 1);
        for(let i = 0; i < lines; i++){
            console.log('');
        }
    },
    responders : {
        help : () => {
            console.log('You asked for help');
            let commands = {
                'exit' : 'Kill the CLI (and the rest of tghe aplication)',
                'man' : 'Show this help page',
                'help' : 'Alias of the "man" command',
                'stats' : 'Get statistics on the underlying operating system and resource utilization',
                'list users' : 'Show a list of all the registered (undeleted) user in the system',
                'more user info --{userId}' : 'Show details of a specific user',
                'list checks --up --down' : 'Show a list of all the active checks in the system, including their state. the "--up" and "--down" flags are both optional',
                'more check info --{checkId}' : 'Show dtails of a specified check',
                'list logs' : 'Show a list of all the log files available to be read (compressed only)',
                'more log info --{fileName}' : 'Show details of a specified log file'
            };

            // Show the header for the help pge that is as wid as tje screen
            cli.horizontalLine();
            cli.centered('CLI MANUAL');
            cli.horizontalLine();
            cli.verticalSpace(2);

            // Show each command, followed by it's explanation, in white and yellow respectively
            for(let key in commands) {
                if(commands.hasOwnProperty(key)) {
                    let value = commands[key];
                    let line = `\x1b[33m${key}\x1b[0m`;
                    let padding = 60 - line.length;
                    for(let i = 0; i < padding; i++){
                        line += ' ';
                    }
                    line += value;
                    console.log(line);
                    cli.verticalSpace();
                }
            }

            cli.verticalSpace(1);

            // End with another hortizonal line
            cli.horizontalLine();
        },
        exit : () => {
           // console.log('You asked for exit');
            process.exit(0);
        },
        stats : () => {
            //console.log('You asked for stats');
            // Complie an object of stats
            let stats = {
                'Load Average' : os.loadavg().join(' '),
                'CPU' : os.cpus().length,
                'Free Memory' : os.freemem(),
                'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
                'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
                'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
                'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
                'Uptime' : `${os.uptime()} Seconds`
            };

            // Create the header for the stats
            cli.horizontalLine();
            cli.centered('SYSTEM STATISTICS');
            cli.horizontalLine();
            cli.verticalSpace(2);

            // Log out each stat
            for(let key in stats) {
                if(stats.hasOwnProperty(key)) {
                    let value = stats[key];
                    let line = `\x1b[33m${key}\x1b[0m`;
                    let padding = 60 - line.length;
                    for(let i = 0; i < padding; i++){
                        line += ' ';
                    }
                    line += value;
                    console.log(line);
                    cli.verticalSpace();
                }
            }

            cli.verticalSpace(1);

            // End with another hortizonal line
            cli.horizontalLine();

        },
        listUsers : () => {
            //console.log('You asked for list users');
            _data.list(Endpoints.USERS, (err, userIds) => {
                if(!err && userIds && userIds.length > 0) {
                    cli.verticalSpace();
                    userIds.forEach((userId) => {
                        _data.read(Endpoints.USERS, userId, (err, userData) => {
                            if(!err && userData) {
                                let numberOfChecks = ArrayUtils.size(userData);
                                let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: ${numberOfChecks}`; 
                                console.log(line);
                                cli.verticalSpace()
                            }
                        });
                    });
                }
            });
        },
        moreUserInfo : (userInput) => {
            //console.log('You asked for more user info', userInput);
            // Get the ID from the string
            let arr = userInput.split('--');
            let userId = StringUtils.isValidString(arr[1]);
            console.log("ID2", userId);
            if(userId) {
                // Lookup the user
                _data.read(Endpoints.USERS, userId, (err, userData) => {
                    if(!err && userData) {
                        // Remove the hashed password
                        delete userData.hashedPassword;

                        // Prin the JSON with text highlighting
                        cli.verticalSpace();
                        console.dir(userData, {'colors' : true});
                        cli.verticalSpace();

                    }
                });
            }
        },
        listChecks : (userInput) => {
            //console.log('You asked for list checks', userInput);
            
            _data.list(Endpoints.CHECKS, (err, checkIds) => {
                if( !err && checkIds && checkIds.length > 0) {
                    cli.verticalSpace();
                    checkIds.forEach((checkId) => {
                        _data.read(Endpoints.CHECKS, checkId, (err, checkData) => {
                            let includeCheck = false;
                            let lowerString = userInput.toLowerCase();

                            // Get the state, but default to down
                            let state = StringUtils.isAcceptableState(checkData.state);
                            let stateOrUnknown = StringUtils.isAcceptableState(state, 'unknown');

                            // If the user specified the state, or hasn't specified any state, include the current check accordingly
                            if(lowerString.indexOf(`--${state}`) > -1 || lowerString.indexOf(`--down`) == -1 && lowerString.indexOf(`--up`) == -1 ) {
                                let line = `ID: ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} State: ${stateOrUnknown}}`;
                                console.log(line);
                                cli.verticalSpace();
                            }
                        });
                    });
                } 
            });
        },
        moreCheckInfo : (userInput) => {
            //console.log('You asked for more check info', userInput);
            // Get the ID from the string
            let arr = userInput.split('--');
            let checkId = StringUtils.isValidString(arr[1]);
            if(checkId) {
                // Lookup the check
                _data.read(Endpoints.CHECKS, checkId, (err, checkData) => {
                    if(!err && checkData) {

                        // Prin the JSON with text highlighting
                        cli.verticalSpace();
                        console.dir(checkData, {'colors' : true});
                        cli.verticalSpace();

                    }
                });
            }
        },
        listLogs : () => {
            //console.log('You asked for list log');
            _logs.list(true, (err, logFileNames) => {
                if(!err && logFileNames && logFileNames.length > 0) {
                    cli.verticalSpace();
                    logFileNames.forEach((logFileName) => {
                        if(logFileName.indexOf('-') > -1) {
                            console.log(logFileName);
                            cli.verticalSpace();
                        }
                    });
                }
            });
        },
        moreLogInfo : (userInput) => {
            //console.log('You asked for more log info', userInput);

            // Get the log file name from the string
            let arr = userInput.split('--');
            let logFileName = StringUtils.isValidString(arr[1]);
            if(logFileName) {
                cli.verticalSpace();
                // Decompress the log
                _logs.decompress(logFileName, (err, strData) => {
                    if(!err && strData) {
                        // Split into lines
                        let logArray = strData.split('\n');
                        logArray.forEach((jsonString) => {
                            let logObj = Parser.parseJsonToObject(jsonString);
                            if(logObj && JSON.stringify(logObj) !== '{}') {
                                console.dir(logObj, {'colors' : true});
                                cli.verticalSpace();
                            }
                        });
                    }
                });
            }



        }
    }
}

// Input handlers
e.on('man', (userInput) => {
    cli.responders.help();
});

e.on('help', (userInput) => {
    cli.responders.help();
});

e.on('exit', (userInput) => {
    cli.responders.exit();
});

e.on('stats', (userInput) => {
    cli.responders.stats();
});

e.on('list users', (userInput) => {
    cli.responders.listUsers();
});

e.on('more user info', (userInput) => {
    cli.responders.moreUserInfo(userInput)
});

e.on('list checks', (userInput) => {
    cli.responders.listChecks(userInput);
});

e.on('more check info', (userInput) => {
    cli.responders.moreCheckInfo(userInput);
});

e.on('list logs', (userInput) => {
    cli.responders.listLogs();
});

e.on('more log info', (userInput) => {
    cli.responders.moreLogInfo(userInput);
});




module.exports = cli;