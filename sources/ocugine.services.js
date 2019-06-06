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
//  @module OcugineServices
//=======================================================================
var ocugineServices = function(OcugineGF) {
    "use strict";

    // Ocugine Services Module Class
    OcugineGF.Services = function(GF) {
      /* TODO: Migrate Ocugine Services from JS SDK */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineServices;
} else {
  ocugineServices(OcugineGF);
}
