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
//  @module OcugineTouch
//=======================================================================
var ocugineTouch = function(OcugineGF) {
    "use strict";

    // Touch Module For Mobile Games
    OcugineGF.Touch = function(GF) {
      // Module Required
      if(GF._isUndefined(OcugineGF.Sprites)) {
        throw "OcugineGF.Touch requires OcugineGF.Sprites Module";
      }

      // Touch Stage
      var touchStage = [0];
      var touchType = 0;

      // Touch System
      GF.EventedClass.extend("TouchSystem",{
        init: function() {
          var touchSystem = this;
          this.boundTouch = function(e) { touchSystem.touch(e); };
          this.boundDrag = function(e) { touchSystem.drag(e); };
          this.boundEnd = function(e) { touchSystem.touchEnd(e); };

          GF.el.addEventListener('touchstart',this.boundTouch);
          GF.el.addEventListener('mousedown',this.boundTouch);

          GF.el.addEventListener('touchmove',this.boundDrag);
          GF.el.addEventListener('mousemove',this.boundDrag);

          GF.el.addEventListener('touchend',this.boundEnd);
          GF.el.addEventListener('mouseup',this.boundEnd);
          GF.el.addEventListener('touchcancel',this.boundEnd);

          this.touchPos = new GF.EventedClass();
          this.touchPos.grid = {};
          this.touchPos.p = { w:1, h:1, cx: 0, cy: 0 };
          this.activeTouches = {};
          this.touchedObjects = {};
        },

        destroy: function() {
          GF.el.removeEventListener('touchstart',this.boundTouch);
          GF.el.removeEventListener('mousedown',this.boundTouch);

          GF.el.removeEventListener('touchmove',this.boundDrag);
          GF.el.removeEventListener('mousemove',this.boundDrag);

          GF.el.removeEventListener('touchend',this.boundEnd);
          GF.el.removeEventListener('mouseup',this.boundEnd);
          GF.el.removeEventListener('touchcancel',this.boundEnd);
        },

        normalizeTouch: function(touch,stage) {
          var el = GF.el,
            rect = el.getBoundingClientRect(),
            style = window.getComputedStyle(el),
            posX = touch.clientX - rect.left - parseInt(style.paddingLeft, 10),
            posY = touch.clientY - rect.top  - parseInt(style.paddingTop, 10);
          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
             posX = touch.offsetX;
             posY = touch.offsetY;
          }

          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
            posX = touch.layerX;
            posY = touch.layerY;
          }

          if(GF._isUndefined(posX) || GF._isUndefined(posY)) {
            if(GF.touch.offsetX === void 0) {
              GF.touch.offsetX = 0;
              GF.touch.offsetY = 0;
              el = GF.el;
              do {
                GF.touch.offsetX += el.offsetLeft;
                GF.touch.offsetY += el.offsetTop;
              } while(el = el.offsetParent);
            }
            posX = touch.pageX - GF.touch.offsetX;
            posY = touch.pageY - GF.touch.offsetY;
          }

          this.touchPos.p.ox = this.touchPos.p.px = posX / GF.cssWidth * GF.width;
          this.touchPos.p.oy = this.touchPos.p.py = posY / GF.cssHeight * GF.height;

          if(stage.viewport) {
            this.touchPos.p.px /= stage.viewport.scale;
            this.touchPos.p.py /= stage.viewport.scale;
            this.touchPos.p.px += stage.viewport.x;
            this.touchPos.p.py += stage.viewport.y;
          }

          this.touchPos.p.x = this.touchPos.p.px;
          this.touchPos.p.y = this.touchPos.p.py;

          this.touchPos.obj = null;
          return this.touchPos;
        },

        touch: function(e) {
          var touches = e.changedTouches || [ e ];

          for(var i=0;i<touches.length;i++) {

            for(var stageIdx=0;stageIdx < touchStage.length;stageIdx++) {
              var touch = touches[i],
                  stage = GF.stage(touchStage[stageIdx]);

              if(!stage) { continue; }

              var touchIdentifier = touch.identifier || 0;
              var pos = this.normalizeTouch(touch,stage);

              stage.regrid(pos,true);
              var col = stage.search(pos,touchType), obj;

              if(col || stageIdx === touchStage.length - 1) {
                obj = col && col.obj;
                pos.obj = obj;
                this.trigger("touch",pos);
              }

              if(obj && !this.touchedObjects[obj]) {
                this.activeTouches[touchIdentifier] = {
                  x: pos.p.px,
                  y: pos.p.py,
                  origX: obj.p.x,
                  origY: obj.p.y,
                  sx: pos.p.ox,
                  sy: pos.p.oy,
                  identifier: touchIdentifier,
                  obj: obj,
                  stage: stage
                };
                this.touchedObjects[obj.p.id] = true;
                obj.trigger('touch', this.activeTouches[touchIdentifier]);
                break;
              }

            }

          }
          //e.preventDefault();
        },

        drag: function(e) {
          var touches = e.changedTouches || [ e ];

          for(var i=0;i<touches.length;i++) {
            var touch = touches[i],
                touchIdentifier = touch.identifier || 0;

            var active = this.activeTouches[touchIdentifier],
                stage = active && active.stage;

            if(active) {
              var pos = this.normalizeTouch(touch,stage);
              active.x = pos.p.px;
              active.y = pos.p.py;
              active.dx = pos.p.ox - active.sx;
              active.dy = pos.p.oy - active.sy;

              active.obj.trigger('drag', active);
            }
          }
          e.preventDefault();
        },

        touchEnd: function(e) {
          var touches = e.changedTouches || [ e ];

          for(var i=0;i<touches.length;i++) {
            var touch = touches[i],
                touchIdentifier = touch.identifier || 0;

            var active = this.activeTouches[touchIdentifier];

            if(active) {
              active.obj.trigger('touchEnd', active);
              delete this.touchedObjects[active.obj.p.id];
              this.activeTouches[touchIdentifier] = null;
            }
          }
          e.preventDefault();
        }
      });

      GF.touch = function(type,stage) {
        GF.untouch();
        touchType = type || GF.SPRITE_UI;
        touchStage = stage || [2,1,0];
        if(!GF._isArray(touchStage)) {
          touchStage = [touchStage];
        }

        if(!GF._touch) {
          GF.touchInput = new GF.TouchSystem();
        }
        return GF;
      };

      GF.untouch = function() {
        if(GF.touchInput) {
          GF.touchInput.destroy();
          delete GF['touchInput'];
        }
        return GF;
      };

    };
};

// Initialize Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineTouch;
} else {
  ocugineTouch(OcugineGF);
}
