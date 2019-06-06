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
//  @module OcugineAudio
//=======================================================================
var ocugineAudio = function(OcugineGF) {
  "use strict";

  // Ocugine Audio Class
  OcugineGF.Audio = function(GF) {
      // Audio Params
      GF.audio = {
        channels: [],
        channelMax:  GF.options.channelMax || 10,
        active: {},
        play: function() {}
      };

      // Has Web Audio
      GF.hasWebAudio = (typeof AudioContext !== "undefined") || (typeof webkitAudioContext !== "undefined");

      if(GF.hasWebAudio) {
        if(typeof AudioContext !== "undefined") {
          GF.audioContext = new AudioContext();
        } else {
          GF.audioContext = new window.webkitAudioContext();
        }
      }

      // Enable Sound
      GF.enableSound = function() {
        var hasTouch =  (typeof window !== "undefined") && !!('ontouchstart' in window);

        if(GF.hasWebAudio) {
          GF.audio.enableWebAudioSound();
        } else {
          GF.audio.enableHTML5Sound();
        }
        return GF;
      };

      // Enable Web Audio Sound
      GF.audio.enableWebAudioSound = function() {
        GF.audio.type = "WebAudio";
        GF.audio.soundID = 0;
        GF.audio.playingSounds = {};
        GF.audio.removeSound = function(soundID) {
          delete GF.audio.playingSounds[soundID];
        };

        GF.audio.play = function(s,options) {
          var now = new Date().getTime();
          if(GF.audio.active[s] && GF.audio.active[s] > now) { return; }
          if(options && options['debounce']) {
            GF.audio.active[s] = now + options['debounce'];
          } else {
            delete GF.audio.active[s];
          }

          var soundID = GF.audio.soundID++;
          var source = GF.audioContext.createBufferSource();
          source.buffer = GF.asset(s);
          source.connect(GF.audioContext.destination);
          if(options && options['loop']) {
            source.loop = true;
          } else {
            setTimeout(function() {
              GF.audio.removeSound(soundID);
            },source.buffer.duration * 1000);
          }
          source.assetName = s;
          if(source.start) { source.start(0); } else { source.noteOn(0); }
          GF.audio.playingSounds[soundID] = source;
        };

        GF.audio.stop = function(s) {
          for(var key in GF.audio.playingSounds) {
            var snd = GF.audio.playingSounds[key];
            if(!s || s === snd.assetName) {
              if(snd.stop) { snd.stop(0);  } else {  snd.noteOff(0); }
            }
          }
        };
      };

      // Enable HTML5 Sound
      GF.audio.enableHTML5Sound = function() {
        GF.audio.type = "HTML5";
        for (var i=0;i<GF.audio.channelMax;i++) {
          GF.audio.channels[i] = {};
          GF.audio.channels[i]['channel'] = new Audio();
          GF.audio.channels[i]['finished'] = -1;
        }

        GF.audio.play = function(s,options) {
          var now = new Date().getTime();
          if(GF.audio.active[s] && GF.audio.active[s] > now) { return; }
          if(options && options['debounce']) {
            GF.audio.active[s] = now + options['debounce'];
          } else {
            delete GF.audio.active[s];
          }

          // Find a free audio channel and play the sound
          for (var i=0;i<GF.audio.channels.length;i++) {
            if (!GF.audio.channels[i]['loop'] && GF.audio.channels[i]['finished'] < now) {
              GF.audio.channels[i]['channel'].src = GF.asset(s).src;
              if(options && options['loop']) {
                GF.audio.channels[i]['loop'] = true;
                GF.audio.channels[i]['channel'].loop = true;
              } else {
                GF.audio.channels[i]['finished'] = now + GF.asset(s).duration*1000;
              }
              GF.audio.channels[i]['channel'].load();
              GF.audio.channels[i]['channel'].play();
              break;
            }
          }
        };

        GF.audio.stop = function(s) {
          var src = s ? GF.asset(s).src : null;
          var tm = new Date().getTime();
          for (var i=0;i<GF.audio.channels.length;i++) {
            if ((!src || GF.audio.channels[i]['channel'].src === src) &&
                (GF.audio.channels[i]['loop'] || GF.audio.channels[i]['finished'] >= tm)) {
              GF.audio.channels[i]['channel'].pause();
              GF.audio.channels[i]['loop'] = false;
            }
          }
        };
      };
  };
};

// Initialize Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineAudio;
} else {
  ocugineAudio(OcugineGF);
}
