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

      // SHA1 Hash Cycle
      GF._rotate_left = function(n, s){
        var t4 = ( n<<s ) | (n>>>(32-s));
        return t4;
      };
      GF._lsb_hex = function(val){
        var str = '';
        var i, vh, vl;
        for( i=0; i<=6; i+=2 ) {
          vh = (val>>>(i*4+4))&0x0f;
          vl = (val>>>(i*4))&0x0f;
          str += vh.toString(16) + vl.toString(16);
        }

        return str;
      };
      GF._cvt_hex = function(val){
        var str='';
        var i, v;
        for( i=7; i>=0; i-- ) {
          v = (val>>>(i*4))&0x0f;
          str += v.toString(16);
        }

        return str;
      };
      GF._UTF8ENCODE = function(string){
        string = string.replace(/\r\n/g,'\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }
        }

        return utftext;
      }

      // Get SHA1 Hash
      GF.Crypto.SHA1 = function(msg){
        var blockstart;
        var i, j;
        var W = new Array(80);
        var H0 = 0x67452301;
        var H1 = 0xEFCDAB89;
        var H2 = 0x98BADCFE;
        var H3 = 0x10325476;
        var H4 = 0xC3D2E1F0;
        var A, B, C, D, E;
        var temp;
        msg = GF._UTF8ENCODE(msg);
        var msg_len = msg.length;
        var word_array = new Array();
        for( i=0; i<msg_len-3; i+=4 ) {
          j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
          msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
          word_array.push(j);
        }

        switch( msg_len % 4 ) {
          case 0:
            i = 0x080000000;
            break;
          case 1:
            i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
            break;
          case 2:
            i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
            break;
          case 3:
            i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8 | 0x80;
            break;
        }

        word_array.push(i);
        while((word_array.length % 16) != 14) word_array.push(0);
        word_array.push(msg_len>>>29);
        word_array.push((msg_len<<3)&0x0ffffffff);
        for (blockstart=0; blockstart<word_array.length; blockstart+=16){
          for(i=0; i<16; i++) W[i] = word_array[blockstart+i];
          for(i=16; i<=79; i++) W[i] = GF._rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
          A = H0; B = H1; C = H2; D = H3; E = H4;

          for( i= 0; i<=19; i++ ) {
            temp = (GF._rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = GF._rotate_left(B,30);
            B = A;
            A = temp;
          }
          for( i=20; i<=39; i++ ) {
            temp = (GF._rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = GF._rotate_left(B,30);
            B = A;
            A = temp;
          }
          for( i=40; i<=59; i++ ) {
            temp = (GF._rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = GF._rotate_left(B,30);
            B = A;
            A = temp;
          }
          for( i=60; i<=79; i++ ) {
            temp = (GF._rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = GF._rotate_left(B,30);
            B = A;
            A = temp;
          }
          H0 = (H0 + A) & 0x0ffffffff;
          H1 = (H1 + B) & 0x0ffffffff;
          H2 = (H2 + C) & 0x0ffffffff;
          H3 = (H3 + D) & 0x0ffffffff;
          H4 = (H4 + E) & 0x0ffffffff;
        }
        var temp = GF._cvt_hex(H0) + GF._cvt_hex(H1) + GF._cvt_hex(H2) + GF._cvt_hex(H3) + GF._cvt_hex(H4);
        return temp.toLowerCase();
      };

      // SHA256 Hash Cycle
      GF._rotate = function(value, amount){
        return (value>>>amount) | (value<<(32 - amount));
      };

      // Get SHA256 Hash
      GF.Crypto.SHA256 = function(ascii){
        var sha256 = { h: 0, k: 0};
        var mathPow = Math.pow;
	      var maxWord = mathPow(2, 32);
      	var lengthProperty = 'length';
      	var i, j;
      	var result = '';

        // ASCII
        var words = [];
	      var asciiBitLength = ascii[lengthProperty]*8;
      	var hash = sha256.h = sha256.h || [];
      	var k = sha256.k = sha256.k || [];
      	var primeCounter = k[lengthProperty];
      	var isComposite = {};
      	for (var candidate = 2; primeCounter < 64; candidate++) {
      		if (!isComposite[candidate]) {
      			for (i = 0; i < 313; i += candidate) {
      				isComposite[i] = candidate;
      			}
      			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
      		}
      	}
      	ascii += '\x80';
      	while (ascii[lengthProperty]%64 - 56) ascii += '\x00';
      	for (i = 0; i < ascii[lengthProperty]; i++) {
      		j = ascii.charCodeAt(i);
      		if (j>>8) return;
      		words[i>>2] |= j << ((3 - i)%4)*8;
      	}
      	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
      	words[words[lengthProperty]] = (asciiBitLength);

      	for (j = 0; j < words[lengthProperty];) {
      		var w = words.slice(j, j += 16);
      		var oldHash = hash;
      		hash = hash.slice(0, 8);
      		for (i = 0; i < 64; i++) {
      			var i2 = i + j;
      			var w15 = w[i - 15], w2 = w[i - 2];
      			var a = hash[0], e = hash[4];
      			var temp1 = hash[7] + (GF._rotate(e, 6) ^ GF._rotate(e, 11) ^ GF._rotate(e, 25)) + ((e&hash[5])^((~e)&hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (GF._rotate(w15, 7) ^ GF._rotate(w15, 18) ^ (w15>>>3)) + w[i - 7] + (GF._rotate(w2, 17) ^ GF._rotate(w2, 19) ^ (w2>>>10)))|0);
      			var temp2 = (GF._rotate(a, 2) ^ GF._rotate(a, 13) ^ GF._rotate(a, 22)) + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      			hash = [(temp1 + temp2)|0].concat(hash);
      			hash[4] = (hash[4] + temp1)|0;
      		}
      		for (i = 0; i < 8; i++) {
      			hash[i] = (hash[i] + oldHash[i])|0;
      		}
      	}

      	for (i = 0; i < 8; i++) {
      		for (j = 3; j + 1; j--) {
      			var b = (hash[i]>>(j*8))&255;
      			result += ((b < 16) ? 0 : '') + b.toString(16);
      		}
      	}

      	return result;
      };

      // Base64 Encode
      GF.Crypto.Base64Encode = function(text){
        return window.btoa(text); // Return
      };

      // Base 64 Decode
      GF.Crypto.Base64Decode = function(data){
        return window.atob(data); // Return
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
