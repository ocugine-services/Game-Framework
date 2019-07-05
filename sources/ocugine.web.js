//=======================================================================
//  Ocugine Game Framework
//  2019 (c) Ocugine Services (Intelligent Solutions, Inc.)
//
//  THIS IS A CORE OF FULL-FEATURED GAME ENGINE (CONSTRUCTOR):
//  https://engine.ocugine.pro/
//
//  Documentation:
//  https://docs.ocugine.pro/en/
//=======================================================================
//=======================================================================
//  @module OcugineWeb
//=======================================================================
var ocugineWeb = function(OcugineGF) {
    "use strict";

    // Ocugine Web Module Class
    OcugineGF.Web = function(GF) {
      // Web Module Object
      GF.Web = {};

      // Check User Online Status
      GF.Web.isOnline = function(){
        return window.navigator.onLine;
      };

      // Send Async GET Request
      GF.Web.sendGetRequest = function(url, callback, error){
        // Check Params
        if(!GF._isString(url)) throw "Failed to send GET request. URL must be a string";
        var done = function(){}; var fail = function(){}; // Callbacks
        if(!GF._isUndefined(callback) && GF._isFunction(callback)) done = callback;
        if(!GF._isUndefined(error) && GF._isFunction(error)) fail = error;

        // Generate Request
        var xhr = new XMLHttpRequest(); // HTTP Request
        xhr.open("GET", url, true); // Open XHR
        xhr.onload = function (e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              done(xhr.responseText);
            } else {
              fail(xhr.statusText); // Return Error
            }
          }
        };
        xhr.onerror = function (e) {
          fail(xhr.statusText); // Return Error
        };
        xhr.send(null);
      };

      // Send Async POST Request
      GF.Web.sendPostRequest = function(url, params, callback, error){
        // Params
        if(GF._isUndefined(url) || !GF._isString(url)) throw "Failed to send POST request. URL must be a string.";
        var _data = (GF._isUndefined(params) || !GF._isObject(params))?{}:params; // Set Data
        var _success = (GF._isUndefined(callback) || !GF._isFunction(callback))?function(){}:callback; // Success Callback
		    var _error = (GF._isUndefined(error) || !GF._isFunction(error))?function(){}:error; // Error Callback

        // Generate Request
        var xhr = new XMLHttpRequest(); // Create XML HTTP Request
		    xhr.open("POST", url, true); // Open Connection
		    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // Set Header

        // XHR Done
        xhr.onreadystatechange = function() {	// Then XHR Status Changed
        	if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) { // Complete
            _success(xhr.responseText); // Send Success Callback
        	}else{
            _error(xhr.statusText); // Return Error
          }
        }

        // XHR Error
        xhr.onerror  = function(){ // Then XHR gets error
          _error(xhr.statusText); // Return Error
        }


        // Send Request
        xhr.send(GF._serializeData(_data));
      };

      // Download File
      GF.Web.downloadFile = function(url){

      };

      // Upload File
      GF.Web.uploadFile = function(){

      };

      // Get User Agent Information
      GF.Web.getUserAgent = function(){
        var ua = window.navigator.userAgent;
        return ua;
      };

      // Show Alert Browser Window
      GF.Web.showAlert = function(msg){
        if(!GF._isString(msg)) throw "Failed to show Alert window. The message is not a string.";
        alert(msg); // Show Alert Message
      };

      // Show Confirm Browser Window
      GF.Web.showConfirm = function(msg, complete, cancel){
        // Check Arguments
        if(!GF._isString(msg)) throw "Failed to show Confirmation window. The message is not a string.";
        if(!GF._isFunction(complete)) complete = function(){};
        if(!GF._isFunction(cancel)) cancel = function(){};

        // Show Confirm
        var _cfrm = confirm(msg); // Show Confirmation Window
        if(_cfrm){ // Confirmed
          complete(); // Run Handler
        }else{ // Non Confirmed
          cancel(); // Handler
        }
      };

      // Show Prompt Browser Window
      GF.Web.showPrompt = function(message){
        if(!GF._isString(message)) throw "Failed to show Prompt window. The message is not a string.";
        var _prmt = prompt(message); // Show Prompt
        return _prmt; // Return Value
      };

      // Open Browser Window
      GF.Web.openWindow = function(url){
        if(!GF._isString(url)) throw "Failed to open new window. The url is not a string.";
        window.open(url); // Open Window
      };

      // Close Browser Window
      GF.Web.closeWindow = function(){
        window.close(); // Close Current Window
      };

      // Get Local Storage
      GF.Web.getStorageKey = function(key){
        if(!GF._isString(key)) throw "Failed to get storage key. The key is not a string.";
        return localStorage.getItem(key); // Get Local Storage
      };

      // Set Local Storage
      GF.Web.setStorageKey = function(key, value){
        if(!GF._isString(key)) throw "Failed to set storage key. The key is not a string.";
        if(!GF._isString(value)) throw "Failed to set value for key "+key+". The value is not a string.";
        localStorage.setItem(key, value); // Set Value
      };

      /* TODO: Web sockets, WebRTC and other */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineWeb;
} else {
  ocugineWeb(OcugineGF);
}
