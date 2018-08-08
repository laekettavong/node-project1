/*
* Workers-related task
*/

// Dependencies
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const _data = require('./data');
const Constants = require('./constants');
const Utils = require('./utils');
const Endpoints = Constants.Endpoints;
const StringUtils = Utils.string;
const TwilioUtil = Utils.twilio

// Instantiate the worker object
const workers = {
    init : () => {
        // Execute all the checks immediately
        workers.gatherAllChecks();

        // Call the loop so the checks will execute later on
        workers.loop();
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
                            console.log('Error reading one of the check\'s data');
                        }
                    })
                })
            } else {
                console.log('Error: Could not find any checks to process');
            }
        })
    },
    // Timer to execute the worker-process once per minute
    loop : () => {
        setInterval(() => {
            workers.gatherAllChecks();
        }, 1000 * 60);
    },
    // Sanity-check the check data
    validateCheckData : (origCheckData) => {
        //console.log(origCheckData);
        origCheckData = StringUtils.isValidCheckData(origCheckData);
        origCheckData.id = StringUtils.isValidCheckDataId(origCheckData.id);
        origCheckData.userPhone = StringUtils.isValidStringPhoneNumber(origCheckData.userPhone);
        origCheckData.protocol = StringUtils.isAcceptableProtocol(origCheckData.protocol);
        origCheckData.url = StringUtils.isValidString(origCheckData.url);
        origCheckData.method = StringUtils.isAcceptableMethod(origCheckData.method);
        origCheckData.successCodes = StringUtils.isSuccessCodes(origCheckData.successCodes);
        origCheckData.timeoutSeconds = StringUtils.isValidTimeoutSeconds(origCheckData.timeoutSeconds);

        // Set the keys that may not be set (if the workers have never seen this check before)
        origCheckData.state = StringUtils.isAcceptableState(origCheckData.state);
        origCheckData.lastChecked = StringUtils.isValidNumber(origCheckData.lastChecked);
       
        // console.log("id: ", origCheckData.id);
        // console.log('userPhone: ', origCheckData.userPhone);
        // console.log("protocol: ", origCheckData.protocol);
        // console.log("url: ", origCheckData.url);
        // console.log("method: ", origCheckData.method);
        // console.log("successCodes: ", origCheckData.successCodes);
        // console.log("timeoutSeconds: ", origCheckData.timeoutSeconds);

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
            console.log('Error: One of the checks is not properly formatted. Skipping it.')
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
                    console.log('Check outcome has not changed, no alert is needed');
                }
            } else {
                console.log('Error trying to save updates to one of the checks');
            }
        });
    },
    // Alert the user as to a change in their status
    alertUserToStatusChange : (newCheckData) => {
        let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
        TwilioUtil.sendSms(newCheckData.userPhone, msg, (err) => {
            if(!err) {
                console.log('Success: User was alerted to a status change in their check via sms', msg);
            } else {
                console.log('Error: could not send sms alert to user who had a state change in their check');
            }
        })
    }
}


// Export the module
module.exports = workers;