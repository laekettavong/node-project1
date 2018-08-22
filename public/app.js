/*
* Frontend logic for the Application
*/

// Contatiner for the froontend application
const app = {
    config : {
        'sessionToken' : false
    },
    // Init (bootstrapping)
    init : () => {
        // Bind all form submissions
        app.bindForms();

        // Bind logout logout button
        app.bindLogoutButton();

        // Get the token from localstorage
        app.getSessionToken();

        // Renew token
        app.tokenRenewalLoop();

        // Load data on page
        app.loadDataOnPage();
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
        if(document.querySelector("form")){
      
          var allForms = document.querySelectorAll("form");
          for(var i = 0; i < allForms.length; i++){
              allForms[i].addEventListener("submit", function(e){
      
              // Stop it from submitting
              e.preventDefault();
              var formId = this.id;
              var path = this.action;
              var method = this.method.toUpperCase();
      
              // Hide the error message (if it's currently shown due to a previous error)
              document.querySelector("#"+formId+" .formError").style.display = 'none';
      
              // Hide the success message (if it's currently shown due to a previous error)
              if(document.querySelector("#"+formId+" .formSuccess")){
                document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
              }
      
      
              // Turn the inputs into a payload
              var payload = {};
              var elements = this.elements;
              for(var i = 0; i < elements.length; i++){
                if(elements[i].type !== 'submit'){
                  // Determine class of element and set value accordingly
                  var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                  var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                  var elementIsChecked = elements[i].checked;
                  // Override the method of the form if the input's name is _method
                  var nameOfElement = elements[i].name;
                  if(nameOfElement == '_method'){
                    method = valueOfElement;
                  } else {
                    // Create an payload field named "method" if the elements name is actually httpmethod
                    if(nameOfElement == 'httpmethod'){
                      nameOfElement = 'method';
                    }
                    // If the element has the class "multiselect" add its value(s) as array elements
                    if(classOfElement.indexOf('multiselect') > -1){
                      if(elementIsChecked){
                        payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                        payload[nameOfElement].push(valueOfElement);
                      }
                    } else {
                      payload[nameOfElement] = valueOfElement;
                    }
      
                  }
                }
              }
      
              // If the method is DELETE, the payload should be a queryStringObject instead
              var queryStringObject = method == 'DELETE' ? payload : {};
      
              // Call the API
              app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
                // Display an error on the form if needed
                console.log("here", method, path, JSON.stringify(payload), statusCode);
   
                if(statusCode !== 200){
      
                  if(statusCode == 403){
                    // log the user out
                    //app.logUserOut();
      
                  } else {
      
                    // Try to get the error from the api, or set a default error message
                    var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
      
                    // Set the formError field with the error text
                    document.querySelector("#"+formId+" .formError").innerHTML = error;
      
                    // Show (unhide) the form error field on the form
                    document.querySelector("#"+formId+" .formError").style.display = 'block';
                  }
                } else {
                  // If successful, send to form response processor
                  app.formResponseProcessor(formId,payload,responsePayload);
                }
      
              });
            });
          }
        }
      },
    formResponseProcessor : (formId, requestPayload, responsePayload) => {
        let functionToCall = false;
        // If account creation was successful, try to immediately log the user in
        if(formId == 'accountCreate') {
            // Take the phone and password, and use it to log the user in
            let newPayload = {
                'phone' : requestPayload.phone,
                'password' : requestPayload.password
            };
        
            app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function(newStatusCode,newResponsePayload) {
                // Display an error on the form if needed
                if(newStatusCode !== 200) {
                    console.log("ERROR2");
                    // Set the formError field with the error text
                    document.querySelector(`#${formId} .formError`).innerHTML = 'Sorry, an error has occured. Please try again.';
            
                    // Show (unhide) the form error field on the form
                    document.querySelector(`#${formId} .formError`).style.display = 'block';
            
                } else {
                    // If successful, set the token and redirect the user
                    app.setSessionToken(newResponsePayload);
                    window.location = '/checks/all';
                }
            });
        }
        // If login was successful, set the token in localstorage and redirect the user
        if(formId == 'sessionCreate'){
            app.setSessionToken(responsePayload);
            window.location = '/checks/all';
        }
      
        // If forms saved successfully and they have success messages, show them
        let formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
        if(formsWithSuccessMessages.indexOf(formId) > -1){ 
            document.querySelector(`#${formId} .formSuccess`).style.display = 'block';
        }
      
        // If the user just deleted their account, redirect them to the account-delete page
        if(formId == 'accountEdit3'){
            app.logUserOut(false);
            window.location = '/account/deleted';
        }

        // If the user just created a new check successfully, redirect back to the dashboard
        if(formId == 'checksCreate'){
            window.location = '/checks/all';
        }
    }, 
    getSessionToken : () => {
        let tokenString = localStorage.getItem('token');
        if(typeof(tokenString) == 'string'){
            try {
                let token = JSON.parse(tokenString);
                app.config.sessionToken = token;
                if(typeof(token) == 'object') {
                    app.setLoggedInClass(true);
                } else {
                    app.setLoggedInClass(false);
                }
            } catch(e) {
                app.config.sessionToken = false;
                app.setLoggedInClass(false);
            }
        }
    },
    setLoggedInClass : (add) => {
        let target = document.querySelector('body');
        if(add) {
            target.classList.add('loggedIn');
        } else {
            target.classList.remove('loggedIn');
        }
    },
    setSessionToken : (token) => {
        app.config.sessionToken = token;
        let tokenString = JSON.stringify(token);
        localStorage.setItem('token',tokenString);
        if(typeof(token) == 'object'){
            app.setLoggedInClass(true);
        } else {
            app.setLoggedInClass(false);
        }
    },
    renewToken : (callback) => {
        let currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
        if(currentToken) {
            // Update the token with a new expiration
            let payload = {
                'id' : currentToken.id,
                'extend' : true,
            };
            app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function(statusCode, responsePayload) {
                // Display an error on the form if needed
                if(statusCode == 200){
                    // Get the new token details
                    let queryStringObject = {'id' : currentToken.id};
                    app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function(statusCode, responsePayload) {
                        // Display an error on the form if needed
                        if(statusCode == 200) {
                            app.setSessionToken(responsePayload);
                            callback(false);
                        } else {
                            app.setSessionToken(false);
                            callback(true);
                        }
                    });
                } else {
                    app.setSessionToken(false);
                    callback(true);
                }
            });
        } else {
            app.setSessionToken(false);
            callback(true);
        }
    },
    tokenRenewalLoop : () => {
        setInterval(() => {
            app.renewToken((err) => {
                if(!err){
                    console.log('Token renewed successfully @ '+Date.now());
                }
            });
        }, 1000 * 60);
    },
    bindLogoutButton : () => {
        document.getElementById('logoutButton').addEventListener('click', (err) => {
            // Stop it from redirecting anywhere
            err.preventDefault();
            // Log the user out
            app.logUserOut();
        });
    },
    logUserOut : () => {
        // Get the current token id
        let tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;
      
        // Send the current token to the tokens endpoint to delete it
        let queryStringObject = {
          'id' : tokenId
        };
        app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
            // Set the app.config token as false
            app.setSessionToken(false);
        
            // Send the user to the logged out page
            window.location = '/session/deleted';
      
        });
    },
    loadDataOnPage : () => {
        // Get the current page from the body class
        let bodyClasses = document.querySelector('body').classList;
        let primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;
      
        // Logic for account settings page
        if(primaryClass == 'accountEdit'){
            app.loadAccountEditPage();
        }
    },
    loadAccountEditPage : () => {
        // Get the phone number from the current token, or log the user out if none is there
        let phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
        if(phone) {
            // Fetch the user data
            let queryStringObject = {
                'phone' : phone
            };
            app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
                if(statusCode == 200) {
                    // Put the data into the forms as values where needed
                    document.querySelector('#accountEdit1 .firstNameInput').value = responsePayload.firstName;
                    document.querySelector('#accountEdit1 .lastNameInput').value = responsePayload.lastName;
                    document.querySelector('#accountEdit1 .displayPhoneInput').value = responsePayload.phone;
            
                    // Put the hidden phone field into both forms
                    let hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhoneNumberInput');
                    for(let i = 0; i < hiddenPhoneInputs.length; i++) {
                        hiddenPhoneInputs[i].value = responsePayload.phone;
                    }

                } else {
                    // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                    app.logUserOut();
                }
            });
        } else {
            app.logUserOut();
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