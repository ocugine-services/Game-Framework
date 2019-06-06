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
      /* TODO: Ocugine Networking Services */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineWeb;
} else {
  ocugineWeb(OcugineGF);
}
