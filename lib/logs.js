/*
* Library for storing and rotating logs
*/


// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {
    // Base directory of the .logs folder
    baseDir : path.join(__dirname, '/../.logs/'),
    // Append a string to a file, create the file if it does not exist
    append : (fileName, str, callback) => {
        // Open the fiel for appending
        fs.open(`${lib.baseDir}/${fileName}.log`, 'a', (err, fileDescriptor) => {
            if(!err && fileDescriptor) {
                // Append to the file and close it
                fs.appendFile(fileDescriptor, `${str}\n`, (err) => {
                    if(!err) {
                        fs.close(fileDescriptor, (err) => {
                            if(!err) {
                                callback(false);
                            } else {
                                callback('Error closing file being appended');
                            }
                        })
                    } else {
                        callback('Error appending to file');
                    }
                })
            } else {
                callback('Could not open the file for appending');
            }
        });
    },
    // List all the logs and optionally include the compressed logs
    list : (includeCompressedLogs, callback) => {
        fs.readdir(lib.baseDir, (err, data) => {
            if(!err && data && data.length > 0){
                let trimmedFileNames = [];
                data.forEach((fileName) => {
                    // Add the .log files
                    if(fileName.indexOf('.log') > -1){
                        trimmedFileNames.push(fileName.replace('.log', ''));
                    }

                    // Add on the .gz files
                    if(includeCompressedLogs && fileName.indexOf('.gz.b64') > -1) {
                        trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                    }
                });
                callback(false, trimmedFileNames);
            } else {
                callback(err, data);
            }
        })
    },
    // Compress contents of one .log file into a .gz.b64 file within the same directory
    compress : (logId, newFileId, callback) => {
        let sourceFile = `${logId}.log`;
        let destFile = `${newFileId}.gz.b64`;

        // Read the source file
        fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (err, inputStr) => {
            if(!err && inputStr){
                // Compress the data using gzip
                zlib.gzip(inputStr, (err, buffer) => {
                    if(!err && inputStr){
                        fs.open(`${lib.baseDir}${destFile}`, 'wx', (err, fileDescriptor) => {
                            if(!err && fileDescriptor) {
                                // Write to the destination file
                                    fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                                        if(!err){
                                            fs.close(fileDescriptor, (err) => {
                                                if(!err){
                                                    callback(false);
                                                } else {
                                                    callback(err);
                                                }
                                            })
                                        } else {
                                            callback(err);
                                        }
                                    })
                            } else {
                                callback(err);
                            }
                        })
                    } else {
                        callback(err);                   
                    }
                })
            } else {
                callback(err);
            }
        })
    },
    // Decompress the contents of a .gz.b64 file into a string variable
    decompress : (fileId, callback) => {
        let fileName = `${fileId}.gz.b64`;
        fs.read(`${lib.baseDir}${fileName}`, 'utf8', (err, str) => {
            if(!err && str){
                // Decompress the data
                let inputBuffer = Buffer.from(str, 'base64');
                lzib.unzip(inputBuffer, (err, outputBuffer) => {
                    if(!err && outputBuffer){
                        let str = outputBuffer.toString();
                        callback(false, str);
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err);
            }
        })
    },
    // Truncate a log file
    truncate : (logId, callback) => {
        fs.truncate(`${lib.baseDir}${logId}.log`, 0, (err) => {
            if(!err){
                callback(false);
            } else {
                callback(err);
            }
        })
    }
}


// Export the moudle
module.exports = lib;