/*
* Library for storing and editing data
*/

const fs = require('fs');
const path = require('path');

//const baseDir = path.join(__dirname, '/../.data');

// Create a contatiner for the module (to be expirted)
const lib = {
        // Base directory of the .data folder
   baseDir : path.join(__dirname, '/../.data'),
    create : (dir, file, data, callback) => {
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
            callback(err, data);
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
                                callback("Error wriing tot existing file")
                            }
                        })
                    } else {
                        callback("Error truncateing file")
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
    }


}




// Export the module
module.exports = lib;
