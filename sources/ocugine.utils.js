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

      /* TODO: Add Color and Maths utils */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineUtils;
} else {
  ocugineUtils(OcugineGF);
}
