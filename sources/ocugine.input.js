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
//  @module OcugineInput
//  /* TODO: Console Controls */
//=======================================================================
var ocugineInput = function(OcugineGF) {
  "use strict";

  // Ocugine Input Module Class
  OcugineGF.Input = function(GF) {
    // Provided key names mapped to key codes - add more names and key codes as necessary
    var KEY_NAMES = GF.KEY_NAMES = {
      LEFT: 37, RIGHT: 39,
      UP: 38, DOWN: 40,

      ZERO : 48, ONE : 49, TWO : 50,
      THREE : 51, FOUR : 52, FIVE : 53,
      SIX : 54, SEVEN : 55, EIGHT : 56,
      NINE : 57,

      A : 65, B : 66, C : 67,
      D : 68, E : 69, F : 70,
      G : 71, H : 72, I : 73,
      J : 74, K : 75, L : 76,
      M : 77, N : 78, O : 79,
      P : 80, GF : 81, R : 82,
      S : 83, T : 84, U : 85,
      V : 86, W : 87, X : 88,
      Y : 89, Z : 90,

      ENTER: 13,
      ESC: 27,
      BACKSPACE : 8,
      TAB : 9,
      SHIFT : 16,
      CTRL : 17,
      ALT : 18,
      SPACE: 32,

      HOME : 36, END : 35,
      PGGUP : 33, PGDOWN : 34
    };

    // Default Keys
    var DEFAULT_KEYS = {
      LEFT: 'left', RIGHT: 'right',
      UP: 'up',     DOWN: 'down',
      SPACE: 'fire',
      Z: 'fire',
      X: 'action',
      ENTER: 'confirm',
      ESC: 'esc',
      P: 'P',
      S: 'S'
    };

    // Default Touch Controls
    var DEFAULT_TOUCH_CONTROLS  = [ ['left','<' ],
                              ['right','>' ],
                              [],
                              ['action','b'],
                              ['fire', 'a' ]];

    // Clockwise from midnight (a la CSS)
    var DEFAULT_JOYPAD_INPUTS =  [ 'up','right','down','left'];

    // Current state of bound inputs
    GF.inputs = {};
    GF.joypad = {};

    // Check Mobile Platform
    var hasTouch =  !!('ontouchstart' in window);

    // Convert a canvas point to a stage point, x dimension
    GF.canvasToStageX = function(x,stage) {
      x = x / GF.cssWidth * GF.width;
      if(stage.viewport) {
        x /= stage.viewport.scale;
        x += stage.viewport.x;
      }
      return x;
    };

    // Convert a canvas point to a stage point, y dimension
    GF.canvasToStageY = function(y,stage) {
        y = y / GF.cssWidth * GF.width;
        if(stage.viewport) {
          y /= stage.viewport.scale;
          y += stage.viewport.y;
        }

        return y;
    };

    // Button and mouse input subsystem for OcugineGF.
    GF.InputSystem = GF.EventedClass.extend({
      keys: {},
      keypad: {},
      keyboardEnabled: false,
      touchEnabled: false,
      joypadEnabled: false,

      // Bind a key name or keycode to an action name (used by `keyboardControls`)
      bindKey: function(key,name) {
        GF.input.keys[KEY_NAMES[key] || key] = name;
      },

      // Enable keyboard controls by binding to events
      enableKeyboard: function() {
        if(this.keyboardEnabled) { return false; }

        // Make selectable and remove an :focus outline
        GF.el.tabIndex = 0;
        GF.el.style.outline = 0;

        GF.el.addEventListener("keydown",function(e) {
          if(GF.input.keys[e.keyCode]) {
            var actionName = GF.input.keys[e.keyCode];
            GF.inputs[actionName] = true;
            GF.input.trigger(actionName);
            GF.input.trigger('keydown',e.keyCode);
          }
          if(!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
          }
        },false);

        GF.el.addEventListener("keyup",function(e) {
          if(GF.input.keys[e.keyCode]) {
            var actionName = GF.input.keys[e.keyCode];
            GF.inputs[actionName] = false;
            GF.input.trigger(actionName + "Up");
            GF.input.trigger('keyup',e.keyCode);
          }
          e.preventDefault();
        },false);

        if(GF.options.autoFocus) {  GF.el.focus(); }
        this.keyboardEnabled = true;
      },

      // Convenience method to activate keyboard controls (call `bindKey` and `enableKeyboard` internally)
      keyboardControls: function(keys) {
        keys = keys || DEFAULT_KEYS;
        GF._each(keys,function(name,key) {
         this.bindKey(key,name);
        },GF.input);
        this.enableKeyboard();
      },

      _containerOffset: function() {
        GF.input.offsetX = 0;
        GF.input.offsetY = 0;
        var el = GF.el;
        do {
          GF.input.offsetX += el.offsetLeft;
          GF.input.offsetY += el.offsetTop;
        } while(el = el.offsetParent);
      },

      touchLocation: function(touch) {
        var el = GF.el,
          posX = touch.offsetX,
          posY = touch.offsetY,
          touchX, touchY;

        if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
          posX = touch.layerX;
          posY = touch.layerY;
        }

        if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
          if(GF.input.offsetX === void 0) { GF.input._containerOffset(); }
          posX = touch.pageX - GF.input.offsetX;
          posY = touch.pageY - GF.input.offsetY;
        }

        touchX = GF.width * posX / GF.cssWidth;
        touchY = GF.height * posY / GF.cssHeight;


        return { x: touchX, y: touchY };
      },

      // Activate touch button controls - pass in an options hash to override
      touchControls: function(opts) {
        if(this.touchEnabled) { return false; }
        if(!hasTouch) { return false; }

        GF.input.keypad = opts = GF._extend({
          left: 0,
          gutter:10,
          controls: DEFAULT_TOUCH_CONTROLS,
          width: GF.width,
          bottom: GF.height,
          fullHeight: false
        },opts);

        opts.unit = (opts.width / opts.controls.length);
        opts.size = opts.unit - (opts.gutter * 2);

        function getKey(touch) {
          var pos = GF.input.touchLocation(touch),
              minY = opts.bottom - opts.unit;
          for(var i=0,len=opts.controls.length;i<len;i++) {
            var minX = i * opts.unit + opts.gutter;
            if(pos.x >= minX && pos.x <= (minX+opts.size) && (opts.fullHeight || (pos.y >= minY + opts.gutter && pos.y <= (minY+opts.unit - opts.gutter))))
            {
              return opts.controls[i][0];
            }
          }
        }

        function touchDispatch(event) {
          var wasOn = {},
              i, len, tch, key, actionName;

          // Reset all the actions bound to controls
          // but keep track of all the actions that were on
          for(i=0,len = opts.controls.length;i<len;i++) {
            actionName = opts.controls[i][0];
            if(GF.inputs[actionName]) { wasOn[actionName] = true; }
            GF.inputs[actionName] = false;
          }

          var touches = event.touches ? event.touches : [ event ];

          for(i=0,len=touches.length;i<len;i++) {
            tch = touches[i];
            key = getKey(tch);

            if(key) {
              // Mark this input as on
              GF.inputs[key] = true;

              // Either trigger a new action
              // or remove from wasOn list
              if(!wasOn[key]) {
                GF.input.trigger(key);
              } else {
                delete wasOn[key];
              }
            }
          }

          // Any remaining were on the last frame
          // and need to trigger an up action
          for(actionName in wasOn) {
            GF.input.trigger(actionName + "Up");
          }

          return null;
        }

        this.touchDispatchHandler = function(e) {
          touchDispatch(e);
          e.preventDefault();
        };


        GF._each(["touchstart","touchend","touchmove","touchcancel"],function(evt) {
          GF.el.addEventListener(evt,this.touchDispatchHandler);
        },this);

        this.touchEnabled = true;
      },

      // Turn off touch (button and joypad) controls and remove event listeners
      disableTouchControls: function() {
        GF._each(["touchstart","touchend","touchmove","touchcancel"],function(evt) {
          GF.el.removeEventListener(evt,this.touchDispatchHandler);
        },this);

        GF.el.removeEventListener('touchstart',this.joypadStart);
        GF.el.removeEventListener('touchmove',this.joypadMove);
        GF.el.removeEventListener('touchend',this.joypadEnd);
        GF.el.removeEventListener('touchcancel',this.joypadEnd);
        this.touchEnabled = false;

        // clear existing inputs
        for(var input in GF.inputs) {
          GF.inputs[input] = false;
        }
      },

      // Activate joypad controls (i.e. 4-way touch controls)
      joypadControls: function(opts) {
          if(this.joypadEnabled) { return false; }
          if(!hasTouch) { return false; }

          var joypad = GF.joypad = GF._defaults(opts || {},{
            size: 50,
            trigger: 20,
            center: 25,
            color: "#CCC",
            background: "#000",
            alpha: 0.5,
            zone: GF.width / 2,
            joypadTouch: null,
            inputs: DEFAULT_JOYPAD_INPUTS,
            triggers: []
          });

          this.joypadStart = function(evt) {
            if(joypad.joypadTouch === null) {
              var touch = evt.changedTouches[0],
                  loc = GF.input.touchLocation(touch);

              if(loc.x < joypad.zone) {
                joypad.joypadTouch = touch.identifier;
                joypad.centerX = loc.x;
                joypad.centerY = loc.y;
                joypad.x = null;
                joypad.y = null;
              }
            }
          };


          this.joypadMove = function(e) {
            if(joypad.joypadTouch !== null) {
              var evt = e;

              for(var i=0,len=evt.changedTouches.length;i<len;i++) {
                var touch = evt.changedTouches[i];

                if(touch.identifier === joypad.joypadTouch) {
                  var loc = GF.input.touchLocation(touch),
                      dx = loc.x - joypad.centerX,
                      dy = loc.y - joypad.centerY,
                      dist = Math.sqrt(dx * dx + dy * dy),
                      overage = Math.max(1,dist / joypad.size),
                      ang =  Math.atan2(dx,dy);

                  if(overage > 1) {
                    dx /= overage;
                    dy /= overage;
                    dist /= overage;
                  }

                  var triggers = [
                    dy < -joypad.trigger,
                    dx > joypad.trigger,
                    dy > joypad.trigger,
                    dx < -joypad.trigger
                  ];

                  for(var k=0;k<triggers.length;k++) {
                    var actionName = joypad.inputs[k];
                    if(triggers[k]) {
                      GF.inputs[actionName] = true;

                      if(!joypad.triggers[k]) {
                        GF.input.trigger(actionName);
                      }
                    } else {
                      GF.inputs[actionName] = false;
                      if(joypad.triggers[k]) {
                        GF.input.trigger(actionName + "Up");
                      }
                    }
                  }

                  GF._extend(joypad, {
                    dx: dx, dy: dy,
                    x: joypad.centerX + dx,
                    y: joypad.centerY + dy,
                    dist: dist,
                    ang: ang,
                    triggers: triggers
                  });

                  break;
                }
              }
            }
            e.preventDefault();
          };

          this.joypadEnd = function(e) {
              var evt = e;

              if(joypad.joypadTouch !== null) {
                for(var i=0,len=evt.changedTouches.length;i<len;i++) {
                var touch = evt.changedTouches[i];
                  if(touch.identifier === joypad.joypadTouch) {
                    for(var k=0;k<joypad.triggers.length;k++) {
                      var actionName = joypad.inputs[k];
                      GF.inputs[actionName] = false;
                        if(joypad.triggers[k]) {
                            GF.input.trigger(actionName + "Up");
                        }
                    }
                    joypad.joypadTouch = null;
                    break;
                  }
                }
              }
              e.preventDefault();
          };

          GF.el.addEventListener("touchstart",this.joypadStart);
          GF.el.addEventListener("touchmove",this.joypadMove);
          GF.el.addEventListener("touchend",this.joypadEnd);
          GF.el.addEventListener("touchcancel",this.joypadEnd);

          this.joypadEnabled = true;
        },

      // Activate mouse controls - mouse controls don't trigger events, but just set `GF.inputs['mouseX']` & `GF.inputs['mouseY']` on each frame.
      mouseControls: function(options) {
        options = options || {};

        var stageNum = options.stageNum || 0;
        var mouseInputX = options.mouseX || "mouseX";
        var mouseInputY = options.mouseY || "mouseY";
        var cursor = options.cursor || "off";

        var mouseMoveObj = {};

        if(cursor !== "on") {
            if(cursor === "off") {
                GF.el.style.cursor = 'none';
            }
            else {
                GF.el.style.cursor = cursor;
            }
        }

        GF.inputs[mouseInputX] = 0;
        GF.inputs[mouseInputY] = 0;

        GF._mouseMove = function(e) {
          e.preventDefault();
          var touch = e.touches ? e.touches[0] : e;
          var el = GF.el,
            rect = el.getBoundingClientRect(),
            style = window.getComputedStyle(el),
            posX = touch.clientX - rect.left - parseInt(style.paddingLeft, 10),
            posY = touch.clientY - rect.top  - parseInt(style.paddingTop, 10);

          var stage = GF.stage(stageNum);

          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
            posX = touch.offsetX;
            posY = touch.offsetY;
          }

          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
            posX = touch.layerX;
            posY = touch.layerY;
          }

          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
            if(GF.input.offsetX === void 0) { GF.input._containerOffset(); }
            posX = touch.pageX - GF.input.offsetX;
            posY = touch.pageY - GF.input.offsetY;
          }

          if(stage) {
            mouseMoveObj.x= GF.canvasToStageX(posX,stage);
            mouseMoveObj.y= GF.canvasToStageY(posY,stage);

            GF.inputs[mouseInputX] = mouseMoveObj.x;
            GF.inputs[mouseInputY] = mouseMoveObj.y;

            GF.input.trigger('mouseMove',mouseMoveObj);
          }
        };

        /**
         * Fired when the user scrolls the mouse wheel up or down
         * Anyone subscribing to the "mouseWheel" event will receive an event with one numeric parameter
         * indicating the scroll direction. -1 for down, 1 for up.
         * @private
         */
        GF._mouseWheel = function(e) {
          // http://www.sitepoint.com/html5-javascript-mouse-wheel/
          // cross-browser wheel delta
          e = window.event || e; // old IE support
          var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
          GF.input.trigger('mouseWheel', delta);
        };

        GF.el.addEventListener('mousemove',GF._mouseMove,true);
        GF.el.addEventListener('touchstart',GF._mouseMove,true);
        GF.el.addEventListener('touchmove',GF._mouseMove,true);
        GF.el.addEventListener('mousewheel',GF._mouseWheel,true);
        GF.el.addEventListener('DOMMouseScroll',GF._mouseWheel,true);
      },

      // Turn off mouse controls
      disableMouseControls: function() {
        if(GF._mouseMove) {
          GF.el.removeEventListener("mousemove",GF._mouseMove, true);
          GF.el.removeEventListener("mousewheel",GF._mouseWheel, true);
          GF.el.removeEventListener("DOMMouseScroll",GF._mouseWheel, true);
          GF.el.style.cursor = 'inherit';
          GF._mouseMove = null;
        }
      },

      // Draw the touch buttons on the screen
      drawButtons: function() {
        var keypad = GF.input.keypad,
            ctx = GF.ctx;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for(var i=0;i<keypad.controls.length;i++) {
          var control = keypad.controls[i];

          if(control[0]) {
            ctx.font = "bold " + (keypad.size/2) + "px arial";
            var x = keypad.left + i * keypad.unit + keypad.gutter,
                y = keypad.bottom - keypad.unit,
                key = GF.inputs[control[0]];

            ctx.fillStyle = keypad.color || "#FFFFFF";
            ctx.globalAlpha = key ? 1.0 : 0.5;
            ctx.fillRect(x,y,keypad.size,keypad.size);

            ctx.fillStyle = keypad.text || "#000000";
            ctx.fillText(control[1],
                         x+keypad.size/2,
                         y+keypad.size/2);
          }
        }

        ctx.restore();
      },

      // Draw Circle
      drawCircle: function(x,y,color,size) {
        var ctx = GF.ctx,
            joypad = GF.joypad;

        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha=joypad.alpha;
        ctx.fillStyle = color;
        ctx.arc(x, y, size, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },

      // Draw the joypad on the screen
      drawJoypad: function() {
        var joypad = GF.joypad;
        if(joypad.joypadTouch !== null) {
          GF.input.drawCircle(joypad.centerX,
                             joypad.centerY,
                             joypad.background,
                             joypad.size);

          if(joypad.x !== null) {
            GF.input.drawCircle(joypad.x,
                             joypad.y,
                             joypad.color,
                             joypad.center);
          }
        }

      },

      // Called each frame by the stage game loop to render any onscreen UI
      drawCanvas: function() {
        if(this.touchEnabled) {
          this.drawButtons();
        }

        if(this.joypadEnabled) {
          this.drawJoypad();
        }
      }
    });

    // Instance of the input subsytem that is actually used during gameplay
    GF.input = new GF.InputSystem();

    // Helper method to activate controls with default options
    GF.controls = function(joypad) {
      GF.input.keyboardControls();

      if(joypad) {
        GF.input.touchControls({
          controls: [ [],[],[],['action','b'],['fire','a']]
        });
        GF.input.joypadControls();
      } else {
        GF.input.touchControls();
      }

      return GF;
    };

    // Platformer Control Component
    GF.component("platformerControls", {
      defaults: {
        speed: 200,
        jumpSpeed: -300,
        collisions: []
      },

      added: function() {
        var p = this.entity.p;

        GF._defaults(p,this.defaults);

        this.entity.on("step",this,"step");
        this.entity.on("bump.bottom",this,"landed");

        p.landed = 0;
        p.direction ='right';
      },

      landed: function(col) {
        var p = this.entity.p;
        p.landed = 1/5;
      },

      step: function(dt) {
        var p = this.entity.p;

        if(p.ignoreControls === undefined || !p.ignoreControls) {
          var collision = null;

          // Follow along the current slope, if possible.
          if(p.collisions !== undefined && p.collisions.length > 0 && (GF.inputs['left'] || GF.inputs['right'] || p.landed > 0)) {
            if(p.collisions.length === 1) {
              collision = p.collisions[0];
            } else {
              // If there's more than one possible slope, follow slope with negative Y normal
              collision = null;

              for(var i = 0; i < p.collisions.length; i++) {
                if(p.collisions[i].normalY < 0) {
                  collision = p.collisions[i];
                }
              }
            }

            // Don't climb up walls.
            if(collision !== null && collision.normalY > -0.3 && collision.normalY < 0.3) {
              collision = null;
            }
          }

          if(GF.inputs['left']) {
            p.direction = 'left';
            if(collision && p.landed > 0) {
              p.vx = p.speed * collision.normalY;
              p.vy = -p.speed * collision.normalX;
            } else {
              p.vx = -p.speed;
            }
          } else if(GF.inputs['right']) {
            p.direction = 'right';
            if(collision && p.landed > 0) {
              p.vx = -p.speed * collision.normalY;
              p.vy = p.speed * collision.normalX;
            } else {
              p.vx = p.speed;
            }
          } else {
            p.vx = 0;
            if(collision && p.landed > 0) {
              p.vy = 0;
            }
          }

          if(p.landed > 0 && (GF.inputs['up'] || GF.inputs['action']) && !p.jumping) {
            p.vy = p.jumpSpeed;
            p.landed = -dt;
            p.jumping = true;
          } else if(GF.inputs['up'] || GF.inputs['action']) {
            this.entity.trigger('jump', this.entity);
            p.jumping = true;
          }

          if(p.jumping && !(GF.inputs['up'] || GF.inputs['action'])) {
            p.jumping = false;
            this.entity.trigger('jumped', this.entity);
            if(p.vy < p.jumpSpeed / 3) {
              p.vy = p.jumpSpeed / 3;
            }
          }
        }
        p.landed -= dt;
      }
    });

    // Step Controls component
    GF.component("stepControls", {
      added: function() {
        var p = this.entity.p;

        if(!p.stepDistance) { p.stepDistance = 32; }
        if(!p.stepDelay) { p.stepDelay = 0.2; }

        p.stepWait = 0;
        this.entity.on("step",this,"step");
        this.entity.on("hit", this,"collision");
      },

      collision: function(col) {
        var p = this.entity.p;

        if(p.stepping) {
          p.stepping = false;
          p.x = p.origX;
          p.y = p.origY;
        }

      },

      step: function(dt) {
        var p = this.entity.p,
            moved = false;
        p.stepWait -= dt;

        if(p.stepping) {
          p.x += p.diffX * dt / p.stepDelay;
          p.y += p.diffY * dt / p.stepDelay;
        }

        if(p.stepWait > 0) { return; }
        if(p.stepping) {
          p.x = p.destX;
          p.y = p.destY;
        }
        p.stepping = false;

        p.diffX = 0;
        p.diffY = 0;

        if(GF.inputs['left']) {
          p.diffX = -p.stepDistance;
        } else if(GF.inputs['right']) {
          p.diffX = p.stepDistance;
        }

        if(GF.inputs['up']) {
          p.diffY = -p.stepDistance;
        } else if(GF.inputs['down']) {
          p.diffY = p.stepDistance;
        }

        if(p.diffY || p.diffX ) {
          p.stepping = true;
          p.origX = p.x;
          p.origY = p.y;
          p.destX = p.x + p.diffX;
          p.destY = p.y + p.diffY;
          p.stepWait = p.stepDelay;
        }

      }

    });
  };
};

// Initialize Input Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineInput;
} else {
  ocugineInput(OcugineGF);
}
