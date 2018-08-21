/*
* Frontend logic for the Application
*/

// Contatiner for the froontend application
const app = {
    config : {
        'sessionToken' : false
    },
    init : () => {
        app.bindForms();
    },
    // AJAX client for RESTful API
    client : {
        request : (headers, path, method, queryStringObj, payload, callback) => {
            headers = StringUtils.isValidObject(headers);
            path = StringUtils.isValidPath(path);
            method = StringUtils.isValidMethod(method);
            queryStringObj = StringUtils.isValidObject(queryStringObj);
            payload = StringUtils.isValidObject(payload);
            callback = StringUtils.isValidFunction(callback);

            // For each query string parameter sent, add it to path
            let requestUrl = `${path}?`;
            let counter = 0;
            for(let paramKey in queryStringObj) {
                if(queryStringObj.hasOwnProperty(paramKey)) {
                    counter++;
                    if(counter > 1) {
                        requestUrl += '&';
                    }
                    requestUrl += `${paramKey}=${queryStringObj[paramKey]}`;
                }
            }

            // Form the http request as a JSON type
            let xhr = new XMLHttpRequest();
            xhr.open(method, requestUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            for(let headerKey in headers) {
                if(headers.hasOwnProperty(headerKey)) {
                    xhr.setRequestHeader(headerKey, headers[headerKey]);
                }
            }

            // If  there is a current session token set, add that as a header as well
            if(app.config.sessionToken){
                xhr.setRequestHeader('token', app.config.sessionToken.id);
            }
            
            // When the request comes back, handle response
            xhr.onreadystatechange = () => {
                if(xhr.readyState == XMLHttpRequest.DONE) {
                    let statusCode = xhr.status;
                    let responseReturned = xhr.responseText;

                    if(callback) {
                        try {
                            callback(statusCode, JSON.parse(responseReturned));
                        } catch(err) {
                            callback(statusCode, false);
                        }
                        
                    }
                }
            }

            xhr.send(JSON.stringify(payload));
        }
    },
    bindForms : () => {
        if(document.querySelector('form')) {
            document.querySelector('form').addEventListener('submit', function(err) {
                // Stop it from submitting
                err.preventDefault();
                let formId = this.id;
                let path = this.action;
                let method = this.method;

                console.log(this.id, this.action, this.method);
            
                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector(`#${formId} .formError`).style.display = 'hidden';
            
                // Turn the inputs into a payload
                let payload = {};
                let elements = this.elements;
                for(let i = 0; i < elements.length; i++) {
                    if(elements[i].type !== 'submit') {
                        let valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
                        payload[elements[i].name] = valueOfElement;
                    }
                }
            
                // Call the API
                app.client.request(undefined, path, method, undefined, payload, (statusCode,responsePayload) => {
                    // Display an error on the form if needed
                    if(statusCode !== 200){
                
                        // Try to get the error from the api, or set a default error message
                        let error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
                
                        // Set the formError field with the error text
                        document.querySelector(`#${formId} .formError`).innerHTML = error;
                
                        // Show (unhide) the form error field on the form
                        document.querySelector(`#${formId} .formError`).style.display = 'block';
                
                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload);
                    }
                });
            });
        }
    },
    formResponseProcessor : (formId, requestPayload, responsePayload) => {
        let functionToCall = false;
        // If account creation was successful, try to immediately log the user in
        if(formId == 'accountCreate'){
            console.log('AccountCrated form was successfully submitted');
            /*

            // Take the phone and password, and use it to log the user in
            let newPayload = {
            'phone' : requestPayload.phone,
            'password' : requestPayload.password
            };

            app.client.request(undefined, 'api/tokens','POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
                // Display an error on the form if needed
                if(newStatusCode !== 200){

                    // Set the formError field with the error text
                    document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

                    // Show (unhide) the form error field on the form
                    document.querySelector("#"+formId+" .formError").style.display = 'block';

                } else {
                    // If successful, set the token and redirect the user
                    app.setSessionToken(newResponsePayload);
                    window.location = '/checks/all';
                }
            });

            */
        }
    }

    
}//app



// Call the init processes after the window loads
window.onload = function() {
    app.init();
};


const StringUtils = {
    isValidString(str, maxLength) {
        if(maxLength){
            return this.isTypeOfString(str) && str.trim().length > 0 && str.trim().length <= maxLength ? str : false; 
        } else {
            return this.isTypeOfString(str) && str.trim().length > 0 ? str : false;
        }
    },
    isValidPath(path) {
        return this.isTypeOfString(path) && path.trim().length > 0 ? path : '/';
    },
    isValidBoolean(bool) {
        return this.isTypeOfBoolean(bool) && bool ? bool : false;
    },
    isValidStringPhoneNumber(numStr) {
        return this.isTypeOfString(numStr) && numStr.trim().length == 10 ? numStr : false;
    },
    isValidNumber(num) {
        return this.isTypeOfNumber(num) && num > 0 ? num : false;
    },
    isValidProtocol(protocol) {
        return this.isTypeOfString(protocol) && ArrayConstants.acceptableProtocols.includes(protocol.toLowerCase()) ? protocol : false;
    },
    isValidMethod(method) {
        return this.isTypeOfString(method) && ArrayConstants.acceptableMethods.includes(method.toLowerCase()) ? method : false;
    },
    isAcceptableState(state) {
        return this.isTypeOfString(state) && ArrayConstants.acceptableStates.includes(state.toLowerCase()) ? state : 'down';
    },
    isSuccessCodes(successCodes) {
        return this.isTypeOfObject(successCodes) && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
    },
    isValidTimeoutSeconds(seconds) {
        return this.isTypeOfNumber(seconds) && seconds % 1 === 0 && seconds >= 1 && seconds <= 5 ? seconds : false;
    },
    isUserChecks(checks) {
        return this.isTypeOfObject(checks) && checks instanceof Array ? checks : [];
    },
    isValidCheckData(checkData) {
        return this.isValidObject(checkData);
    },
    isValidObject(obj) {
        return this.isTypeOfObject(obj) && obj !== null ? obj : {};
    },
    isValidFunction(funct) {
        return this.isTypeOfFunction(funct) ? funct : false;
    },
    isValidCheckDataId(id) {
        return this.isTypeOfString(id) && id.trim().length == 20 ? id.trim() : false;
    },
    isTypeOfString(dataType) {
        return typeof(dataType) == 'string';
    },
    isTypeOfNumber(dataType) {
        return typeof(dataType) == 'number';
    },
    isTypeOfBoolean(dataType) {
        return typeof(dataType) == 'boolean';
    },
    isTypeOfObject(dataType) {
        return typeof(dataType) == 'object';
    },
    isTypeOfFunction(dataType) {
        return typeof(dataType) == 'function';
    }
}

const ArrayConstants = {
    acceptableMethods : ['get', 'post', 'put', 'delete'],
    acceptableProtocols : ['https', 'http'],
    acceptableStates : ['up', 'down']
}