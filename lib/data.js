/*
* Library for storing and editing data
*/

const fs = require('fs');
const path = require('path');
const Utils = require('./utils');
const Parser = Utils.parser;
const StringUtils = Utils.string;
const ArrayUtils = Utils.array;

//const baseDir = path.join(__dirname, '/../.data');

// Create a contatiner for the module (to be expirted)
const lib = {
    // Base directory of the .data folder
   baseDir : path.join(__dirname, '/../.data'),
    create : (dir, file, data, callback) => {
        // console.log(dir, file, data);
        // Open the file for writing
        fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        //fs.open( baseDir + '/' +dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
            if(!err && fileDescriptor){
                // Convert data to string
                let stringData = JSON.stringify(data);

                // Write to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if(!err){
                        fs.close(fileDescriptor, (err) => {
                            if(!err){
                                callback(false); // false error is actually no error...a good thing
                            } else {
                                callback('Error while closing file');
                            }
                        });
                    } else {
                        callback('Error writing to new file');
                    }
                })
            } else {
                callback('Could not create new file, it may already exist');
            }
        });
    },
    read : (dir, file, callback) => {
        fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
            if(!err && data){
                callback(false, Parser.parseJsonToObject(data));
            } else {
                callback(err, data);
            }
        })
    },
    update : (dir, file, data, callback) => {
        // Open the file for writing
        fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+',(err, fileDescriptor) => {
            if(!err && fileDescriptor){
                // Convert data to string
                let stringData = JSON.stringify(data);

                // Truncate the file
                fs.truncate(fileDescriptor, (err) => {
                    if(!err){
                        // Write to fike and close it
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if(!err){
                                fs.close(fileDescriptor, (err) => {
                                    if(!err){
                                        callback(false);
                                    } else {
                                        callback("Error while closing file");
                                    }
                                })
                            } else {
                                callback("Error writing to existing file")
                            }
                        })
                    } else {
                        callback("Error truncating file")
                    }
                })

            } else {
                callback('Could not open the file for updating, it may not exist yet');
            }
        })
    },
    delete : (dir, file, callback) => {
        // Unlink/remove the file
        fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
            if(!err){
                callback(false);
            } else {
                callback('Error deleting file')
            }
        })
    },
    // List all the files within the specified dir minus the file extension
    list : (dir, callback) => {
        fs.readdir(`${lib.baseDir}/${dir}`, (err, data) => {
            if(!err && data && data.length > 0){
                callback(false, ArrayUtils.spliceStringFromElements(data, '.json'));
            } else {
                callback(err, data)
            }
        });
    }
}

const FsTemplate = {
    baseDir : path.join(__dirname, '/../templates/'),
    readFile : (templateName, callback) => {
        fs.readFile(`${FsTemplate.baseDir}${templateName}.html`, 'utf8', (err, str) => {
            if(!err && str && StringUtils.isValidString(str)) {
                callback(false, str);
            } else {
                callback('Template not found');
            }
        });
    }
}


// Get the contents of a static (publiv]c) asset
const FsPublic = {
    baseDir : path.join(__dirname, '/../public/'),
    getStaticAsset : (fileName, callback) => {
        fileName = StringUtils.isValidString(fileName);
        if(fileName) {
            fs.readFile(`${FsPublic.baseDir}${fileName}`, (err, data) => {
                if(!err && data) {
                    callback(false, data);
                } else {
                    callback('No file could be found');
                }
             });
        } else {
            callback('A valid file was not specified');
        }
    }
}

// Export the module
module.exports = lib;
module.exports.FsTemplate = FsTemplate;
module.exports.FsPublic = FsPublic;
