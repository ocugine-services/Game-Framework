//=======================================================================
//  Ocugine Game Framework
//  2019 (c) Ocugine Services (Intelligent Solutions, Inc.)
//
//  THIS IS A CRYPTOGRAPHY PLUGIN FOR OCUGINE GAME FRAMEWORK:
//  https://engine.ocugine.pro/
//
//  Documentation:
//  https://docs.ocugine.pro/en/
//=======================================================================
//=======================================================================
//  @module OcugineUtils
//=======================================================================
var ocugineCrypto = function(OcugineGF) {
    "use strict";

    // Ocugine Crypto Module Class
    OcugineGF.Crypto = function(GF) {
      // Create Object for Crypto
      GF.Crypto = {};

      // MD5 Cycle
      GF._md5cycle = function(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = GF._ff(a, b, c, d, k[0], 7, -680876936);
        d = GF._ff(d, a, b, c, k[1], 12, -389564586);
        c = GF._ff(c, d, a, b, k[2], 17,  606105819);
        b = GF._ff(b, c, d, a, k[3], 22, -1044525330);
        a = GF._ff(a, b, c, d, k[4], 7, -176418897);
        d = GF._ff(d, a, b, c, k[5], 12,  1200080426);
        c = GF._ff(c, d, a, b, k[6], 17, -1473231341);
        b = GF._ff(b, c, d, a, k[7], 22, -45705983);
        a = GF._ff(a, b, c, d, k[8], 7,  1770035416);
        d = GF._ff(d, a, b, c, k[9], 12, -1958414417);
        c = GF._ff(c, d, a, b, k[10], 17, -42063);
        b = GF._ff(b, c, d, a, k[11], 22, -1990404162);
        a = GF._ff(a, b, c, d, k[12], 7,  1804603682);
        d = GF._ff(d, a, b, c, k[13], 12, -40341101);
        c = GF._ff(c, d, a, b, k[14], 17, -1502002290);
        b = GF._ff(b, c, d, a, k[15], 22,  1236535329);
        a = GF._gg(a, b, c, d, k[1], 5, -165796510);
        d = GF._gg(d, a, b, c, k[6], 9, -1069501632);
        c = GF._gg(c, d, a, b, k[11], 14,  643717713);
        b = GF._gg(b, c, d, a, k[0], 20, -373897302);
        a = GF._gg(a, b, c, d, k[5], 5, -701558691);
        d = GF._gg(d, a, b, c, k[10], 9,  38016083);
        c = GF._gg(c, d, a, b, k[15], 14, -660478335);
        b = GF._gg(b, c, d, a, k[4], 20, -405537848);
        a = GF._gg(a, b, c, d, k[9], 5,  568446438);
        d = GF._gg(d, a, b, c, k[14], 9, -1019803690);
        c = GF._gg(c, d, a, b, k[3], 14, -187363961);
        b = GF._gg(b, c, d, a, k[8], 20,  1163531501);
        a = GF._gg(a, b, c, d, k[13], 5, -1444681467);
        d = GF._gg(d, a, b, c, k[2], 9, -51403784);
        c = GF._gg(c, d, a, b, k[7], 14,  1735328473);
        b = GF._gg(b, c, d, a, k[12], 20, -1926607734);
        a = GF._hh(a, b, c, d, k[5], 4, -378558);
        d = GF._hh(d, a, b, c, k[8], 11, -2022574463);
        c = GF._hh(c, d, a, b, k[11], 16,  1839030562);
        b = GF._hh(b, c, d, a, k[14], 23, -35309556);
        a = GF._hh(a, b, c, d, k[1], 4, -1530992060);
        d = GF._hh(d, a, b, c, k[4], 11,  1272893353);
        c = GF._hh(c, d, a, b, k[7], 16, -155497632);
        b = GF._hh(b, c, d, a, k[10], 23, -1094730640);
        a = GF._hh(a, b, c, d, k[13], 4,  681279174);
        d = GF._hh(d, a, b, c, k[0], 11, -358537222);
        c = GF._hh(c, d, a, b, k[3], 16, -722521979);
        b = GF._hh(b, c, d, a, k[6], 23,  76029189);
        a = GF._hh(a, b, c, d, k[9], 4, -640364487);
        d = GF._hh(d, a, b, c, k[12], 11, -421815835);
        c = GF._hh(c, d, a, b, k[15], 16,  530742520);
        b = GF._hh(b, c, d, a, k[2], 23, -995338651);
        a = GF._ii(a, b, c, d, k[0], 6, -198630844);
        d = GF._ii(d, a, b, c, k[7], 10,  1126891415);
        c = GF._ii(c, d, a, b, k[14], 15, -1416354905);
        b = GF._ii(b, c, d, a, k[5], 21, -57434055);
        a = GF._ii(a, b, c, d, k[12], 6,  1700485571);
        d = GF._ii(d, a, b, c, k[3], 10, -1894986606);
        c = GF._ii(c, d, a, b, k[10], 15, -1051523);
        b = GF._ii(b, c, d, a, k[1], 21, -2054922799);
        a = GF._ii(a, b, c, d, k[8], 6,  1873313359);
        d = GF._ii(d, a, b, c, k[15], 10, -30611744);
        c = GF._ii(c, d, a, b, k[6], 15, -1560198380);
        b = GF._ii(b, c, d, a, k[13], 21,  1309151649);
        a = GF._ii(a, b, c, d, k[4], 6, -145523070);
        d = GF._ii(d, a, b, c, k[11], 10, -1120210379);
        c = GF._ii(c, d, a, b, k[2], 15,  718787259);
        b = GF._ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = GF._add32(a, x[0]);
        x[1] = GF._add32(b, x[1]);
        x[2] = GF._add32(c, x[2]);
        x[3] = GF._add32(d, x[3]);
      };
      GF._cmn = function(q, a, b, x, s, t) {
        a = GF._add32(GF._add32(a, q), GF._add32(x, t));
        return GF._add32((a << s) | (a >>> (32 - s)), b);
      };
      GF._ff = function(a, b, c, d, x, s, t) {
        return GF._cmn((b & c) | ((~b) & d), a, b, x, s, t);
      };
      GF._gg = function(a, b, c, d, x, s, t) {
        return GF._cmn((b & d) | (c & (~d)), a, b, x, s, t);
      };
      GF._hh = function(a, b, c, d, x, s, t) {
        return GF._cmn(b ^ c ^ d, a, b, x, s, t);
      };
      GF._ii = function(a, b, c, d, x, s, t) {
        return GF._cmn(c ^ (b | (~d)), a, b, x, s, t);
      };
      GF._md51 = function(s) {
        var txt = '';
        var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;

        for (i=64; i<=s.length; i+=64) {
          GF._md5cycle(state, GF._md5blk(s.substring(i-64, i)));
        }

        s = s.substring(i-64);
        var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        for (i=0; i<s.length; i++)
          tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
          tail[i>>2] |= 0x80 << ((i%4) << 3);

        if (i > 55) {
          GF._md5cycle(state, tail);
          for (i=0; i<16; i++) tail[i] = 0;
        }

        tail[14] = n*8;
        GF._md5cycle(state, tail);
        return state;
      };
      GF._md5blk = function(s) {
        var md5blks = [], i;
        for (i=0; i<64; i+=4) {
          md5blks[i>>2] = s.charCodeAt(i) + (s.charCodeAt(i+1) << 8) + (s.charCodeAt(i+2) << 16) + (s.charCodeAt(i+3) << 24);
        }
        return md5blks;
      };
      GF._hex_chr = '0123456789abcdef'.split('');
      GF._rhex = function(n){
        var s='', j=0;
        for(; j<4; j++)
        s += GF._hex_chr[(n >> (j * 8 + 4)) & 0x0F] + GF._hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
      };
      GF._hex = function(x) {
        for (var i=0; i<x.length; i++)
        x[i] = GF._rhex(x[i]);
        return x.join('');
      };
      GF._add32 = function(a, b) {
        return (a + b) & 0xFFFFFFFF;
      }

      // Get MD5 Hash
      GF.Crypto.md5 = function(hashable){
        return GF._hex(GF._md51(hashable));
      };

      /* TODO: Sha and AES encryption */
    };
};

// Initialize Ocugine Serivces Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineCrypto;
} else {
  ocugineCrypto(OcugineGF);
}
