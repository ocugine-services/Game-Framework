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
//  @module OcugineCordova
//=======================================================================
var ocugineCordova = function(OcugineGF) {
    "use strict";

    // Ocugine Cordova Module Class
    OcugineGF.Cordova = function(GF) {
      /* TODO: Ocugine Cordova Class */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineCordova;
} else {
  ocugineCordova(OcugineGF);
}
