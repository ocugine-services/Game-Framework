//=======================================================================
//  Ocugine Game Framework Example
//  2019 (c) Ocugine Services (Intelligent Solutions, Inc.)
//
//  THIS IS AN EXAMPLE OF USAGE OCUGINE GAME FRAMEWORK A PART OF OCUGINE GAME BUILDER:
//  https://engine.ocugine.pro/
//
//  Documentation:
//  https://docs.ocugine.pro/en/
//=======================================================================
//=======================================================================
//  @module Game Example
//=======================================================================
// Initialize Game Framework
var Game = OcugineGF().include("Sprites,Scenes,Input,2D,Touch,UI,Web,Crypto").setup({
  maximize: true
}).controls().touch();
