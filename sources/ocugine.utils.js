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
//  @module OcugineUtils
//=======================================================================
var ocugineUtils = function(OcugineGF) {
    "use strict";

    // Ocugine Utils Module Class
    OcugineGF.Utils = function(GF) {
      // Create Object for Utils
      GF.Utils = {};

      // Get OS Information
      GF.Utils.getOS = function(){
        return window.navigator.oscpu; // Return OS
      };

      // Get User Language
      GF.Utils.getLanguage = function(){
        return window.navigator.language;
      };

      // Vibrate or return false if can't vibrate
      GF.Utils.vibrate = function(pattern){
        return window.navigator.vibrate(pattern);
      };

      // Set Window Timeout
      GF.Web.setTimeout = function(method, timeout){
        if(!GF._isFunction(method)) throw "Failed to set timeout. The first argument is not a function.";
        return setTimeout(method, timeout); // Return Interval Object
      };

      // Remove Window timeout
      GF.Web.removeTimeout = function(tm){
        cleatTimeout(tm);
      };

      // Set Window Interval
      GF.Web.setInterval = function(method, interval){
        if(!GF._isFunction(method)) throw "Failed to set interval. The first argument is not a function.";
        return setInterval(method, interval); // Return Interval Object
      };

      // Remove interval
      GF.Web.removeInterval = function(interval){
        clearInterval(interval); // Clear Interval
      };

      // Serialize Data
      GF._serializeData = function(obj){
		    if(GF._isUndefined(obj) || !GF._isObject(obj)) throw "Failed to serialize object to URL parts. Please, check documentation.";
    		var str = Object.keys(obj).map(function(prop) {
    		  return [prop, obj[prop]].map(encodeURIComponent).join("=");
    		}).join("&");
		    return str;
      };

      /* TODO: Add Color and Maths utils */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineUtils;
} else {
  ocugineUtils(OcugineGF);
}
