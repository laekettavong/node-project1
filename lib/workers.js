/*
* Workers-related task
*/

// Dependencies
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const util = require('util');
const debug = util.debuglog('workers');
const _data = require('./data');
const _logs = require('./logs');
const Constants = require('./constants');
const Config = require('./config');
const Utils = require('./utils');
const Endpoints = Constants.Endpoints;
const Colors = Constants.ConsoleColors;
const StringUtils = Utils.string;
const TwilioUtil = Utils.twilio
const ArrayUtils = Utils.array;

// Instantiate the worker object
const workers = {
    init : () => {
        // Send to console in yellow
        console.log(Colors.YELLOW, 'Background workers are running');

        // Execute all the checks immediately
        workers.gatherAllChecks();

        // Call the loop so the checks will execute later on
        workers.loop();

        // Compress all the logs immediately
        workers.rotateLogs();

        // Call the compression loop so logs will be compressed later on
        workers.logRotationLoop();
    },
    // Lookup all checks, get their data, send to a validator
    gatherAllChecks : () => {
        // Get all the checks
        _data.list(Endpoints.CHECKS, (err, checks) => {
            if(!err && checks && checks.length > 0){
                checks.forEach((check) => {
                    _data.read(Endpoints.CHECKS, check, (err, origCheckData) => {
                        if(!err && origCheckData){
                            // Pass it to the check validator, and let that function continue or log error as needed
                            workers.validateCheckData(origCheckData);
                        } else {
                            debug('Error reading one of the check\'s data');
                        }
                    })
                })
            } else {
                debug('Error: Could not find any checks to process');
            }
        })
    },
    // Rotate (compress) the log files
    rotateLogs : () => {
        // List all the (non compressed) log files
        _logs.list(false, (err, logs) => {
            if(!err && logs && logs.length > 0){
                logs.forEach((logName) => {
                    // Compress the data to a different file
                    let logId = logName.replace('.log', '');
                    let newFileId = `${logId}-${Date.now()}`;
                    _logs.compress(logId, newFileId, (err) => {
                        if(!err){
                            // Truncate the log
                            _logs.truncate(logId, (err)=> {
                                if(!err) {
                                    debug('Success truncating logFile', logId);
                                }else {
                                    debug('Error truncating logFile', logId);
                                } 
                            })
                        } else {
                            debug('Error compressing one of the log files', err);
                        }
                    })
                })                
            } else {
                debug('Error: could not file any log files to rotate');
            }
        })
    },
    // Timer to execute the worker-process once per minute
    loop : () => {
        setInterval(() => {
            workers.gatherAllChecks();
        }, 1000 * Config.workersIntervalSeconds);
    },
    // Timer to execute the log-rotation preocess once a day
    logRotationLoop : () => {
        setInterval(() => {
            workers.rotateLogs();
        }, 1000 * 60 * 60 * 24);
    },
    // Sanity-check the check data
    validateCheckData : (origCheckData) => {
        //debug(origCheckData);
        origCheckData = StringUtils.isValidCheckData(origCheckData);
        origCheckData.id = StringUtils.isValidCheckDataId(origCheckData.id);
        origCheckData.userPhone = StringUtils.isValidStringPhoneNumber(origCheckData.userPhone);
        origCheckData.protocol = StringUtils.isValidProtocol(origCheckData.protocol);
        origCheckData.url = StringUtils.isValidString(origCheckData.url);
        origCheckData.method = StringUtils.isValidMethod(origCheckData.method);
        origCheckData.successCodes = StringUtils.isSuccessCodes(origCheckData.successCodes);
        origCheckData.timeoutSeconds = StringUtils.isValidTimeoutSeconds(origCheckData.timeoutSeconds);

        // Set the keys that may not be set (if the workers have never seen this check before)
        origCheckData.state = StringUtils.isAcceptableState(origCheckData.state);
        origCheckData.lastChecked = StringUtils.isValidNumber(origCheckData.lastChecked);
       
        // debug("id: ", origCheckData.id);
        // debug('userPhone: ', origCheckData.userPhone);
        // debug("protocol: ", origCheckData.protocol);
        // debug("url: ", origCheckData.url);
        // debug("method: ", origCheckData.method);
        // debug("successCodes: ", origCheckData.successCodes);
        // debug("timeoutSeconds: ", origCheckData.timeoutSeconds);

        // If all the checks pass, pass the data along to the next step in the process
        if(origCheckData.id &&
        origCheckData.userPhone &&
        origCheckData.protocol &&
        origCheckData.url &&
        origCheckData.method &&
        origCheckData.successCodes &&
        origCheckData.timeoutSeconds) {
            workers.performCheck(origCheckData);
        } else {
            debug('Error: One of the checks is not properly formatted. Skipping it.')
        }
    },
    // Prrform the check, send the origCheckData and the outcome of the check process to the next step in the process
    performCheck : (origCheckData) => {
        // Perpare the initial check outcome
        let checkOutcome = {
            'error' : false,
            'responseCode' : false
        }

        // Mak that the outcome has not been sent yet
        let outcomeSent = false;

        // Parse the hostname and the path put of the original check data
        let parsedUrl = url.parse(`${origCheckData.protocol}://${origCheckData.url}`);
        let hostName = parsedUrl.hostname;
        let path = parsedUrl.path; // Using path and not 'pathname' because we want the query string

        // Construct the request
        let requestDetails = {
            'protocol' : `${origCheckData.protocol}:`,
            'hostname' : hostName,
            'method' : origCheckData.method.toUpperCase(),
            'path' : path,
            'timeout' : origCheckData.timeoutSeconds * 1000
        }

        console.log('WFT1', origCheckData.protocol);
        // Instantiate the request object (using either the HTTP or HTTPS module)
        let moduleToUse = origCheckData == 'http' ? http : https;
        let req = moduleToUse.request(requestDetails, (res) => {
            let status = res.statusCode;

            // Update the checkOutcome and pass it along
            checkOutcome.responseCode = status;
            if(!outcomeSent){
                workers.processCheckOutcome(origCheckData, checkOutcome);
                outcomeSent = true;
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', (err) => {
            checkOutcome.error = {
                'error' : true,
                'value' : 'timeout'
            };

            if(!outcomeSent){
                workers.processCheckOutcome(origCheckData, checkOutcome);
                outcomeSent = true;
            }
        })

        // Bind to the timeout event
        req.on('timeout', (err) => {
            checkOutcome.error = {
                'error' : true,
                'value' : err
            };

            if(!outcomeSent){
                workers.processCheckOutcome(origCheckData, checkOutcome);
                outcomeSent = true;
            }
        });
        req.end();
    }, 
    // Proess the checkOutcome and update the check data as needed and trigger an alert if needed
    // Special logic for accomodating a check tht has never been tested before (don't want to alert)
    processCheckOutcome : (origCheckData, checkOutcome) => {
        
        // Decide if the check is considered up or down
        let state = !checkOutcome.error && checkOutcome.responseCode && origCheckData.successCodes.includes(checkOutcome.responseCode) ? 'up' : 'down';

        // Decide if an alert is warranted
        let isAlertWarranted = origCheckData.lastChecked && origCheckData.state !== state ? true : false;

        // Look the coutcome of the check
        let timeOfCheck = Date.now();
        workers.log(origCheckData, checkOutcome, state, isAlertWarranted, timeOfCheck);

        // Update the check data
        let newCheckData = origCheckData;
        newCheckData.state = state;
        newCheckData.lastChecked = Date.now();

 
        // Save the updates
        _data.update(Endpoints.CHECKS, newCheckData.id, newCheckData, (err) => {
            if(!err){
                if(isAlertWarranted){
                    // Send the new darta to the next phase in the process if needed
                    workers.alertUserToStatusChange(newCheckData);
                } else {
                    debug('Check outcome has not changed, no alert is needed');
                }
            } else {
                debug('Error trying to save updates to one of the checks');
            }
        });
    },
    // Alert the user as to a change in their status
    alertUserToStatusChange : (newCheckData) => {
        let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
        TwilioUtil.sendSms(newCheckData.userPhone, msg, (err) => {
            if(!err) {
                debug('Success: User was alerted to a status change in their check via sms', msg);
            } else {
                debug('Error: could not send sms alert to user who had a state change in their check');
            }
        })
    },
    log : (origCheckData, checkOutcome, state, isAlertWarranted, timeOfCheck) => {
        let logData = {
            'check' : origCheckData,
            'outcome' : checkOutcome,
            'state' : state,
            'alert' : isAlertWarranted,
            'time' : timeOfCheck
        };

        // Convert data to string
        let logString = JSON.stringify(logData);

        // Determine the name of the log file
        let logFileName = origCheckData.id;

        // Append the log string to the file
        _logs.append(logFileName, logString, (err) => {
            if(!err){
                debug('Logging to file succeeded');
            } else {
                debug('Logging to file failed');
            }
        });
    }
}


// Export the module
module.exports = workers;