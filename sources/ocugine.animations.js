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
//  @module OcugineAnim
//=======================================================================
var ocugineAnim = function(OcugineGF) {
  "use strict";
  OcugineGF.Anim = function(GF) {
    // Animations
    GF._animations = {};
    GF.animations = function(sprite,animations) {
      if(!GF._animations[sprite]) { GF._animations[sprite] = {}; }
      GF._extend(GF._animations[sprite],animations);
    };

    // Animation
    GF.animation = function(sprite,name) {
      return GF._animations[sprite] && GF._animations[sprite][name];
    };

    // Animation Component
    GF.component('animation',{
      added: function() {
        var p = this.entity.p;
        p.animation = null;
        p.animationPriority = -1;
        p.animationFrame = 0;
        p.animationTime = 0;
        this.entity.on("step",this,"step");
      },
      extend: {
        play: function(name,priority,resetFrame) {
          this.animation.play(name,priority,resetFrame);
        }
      },
      step: function(dt) {
        var entity = this.entity,
            p = entity.p;
        if(p.animation) {
          var anim = GF.animation(p.sprite,p.animation),
              rate = anim.rate || p.rate,
              stepped = 0;
          p.animationTime += dt;
          if(p.animationChanged) {
            p.animationChanged = false;
          } else {
            if(p.animationTime > rate) {
              stepped = Math.floor(p.animationTime / rate);
              p.animationTime -= stepped * rate;
              p.animationFrame += stepped;
            }
          }
          if(stepped > 0) {
            if(p.animationFrame >= anim.frames.length) {
              if(anim.loop === false || anim.next) {
                p.animationFrame = anim.frames.length - 1;
                entity.trigger('animEnd');
                entity.trigger('animEnd.' + p.animation);
                p.animation = null;
                p.animationPriority = -1;
                if(anim.trigger) {
                  entity.trigger(anim.trigger,anim.triggerData);
                }
                if(anim.next) { this.play(anim.next,anim.nextPriority); }
                return;
              } else {
                entity.trigger('animLoop');
                entity.trigger('animLoop.' + p.animation);
                p.animationFrame = p.animationFrame % anim.frames.length;
              }
            }
            entity.trigger("animFrame");
          }
          p.sheet = anim.sheet || p.sheet;
          p.frame = anim.frames[p.animationFrame];
          if(anim.hasOwnProperty("flip")) { p.flip  = anim.flip; }
        }
      },
      play: function(name,priority,resetFrame) {
        var entity = this.entity,
            p = entity.p;
        priority = priority || 0;
        if(name !== p.animation && priority >= p.animationPriority) {
          if(resetFrame === undefined) {
            resetFrame = true;
          }
          p.animation = name;
          if(resetFrame) {
            p.animationChanged = true;
            p.animationTime = 0;
            p.animationFrame = 0;
          }
          p.animationPriority = priority;
          entity.trigger('anim');
          entity.trigger('anim.' + p.animation);
        }
      }
    });

    // Repeated Sprite
    GF.Sprite.extend("Repeater",{
      init: function(props) {
        this._super(GF._defaults(props,{
          speedX: 1,
          speedY: 1,
          repeatY: true,
          repeatX: true,
          renderAlways: true,
          type: 0
        }));
        this.p.repeatW = this.p.repeatW || this.p.w;
        this.p.repeatH = this.p.repeatH || this.p.h;
      },

      draw: function(ctx) {
        var p = this.p,
            asset = this.asset(),
            sheet = this.sheet(),
            scale = this.stage.viewport ? this.stage.viewport.scale : 1,
            viewX = Math.floor(this.stage.viewport ? this.stage.viewport.x : 0),
            viewY = Math.floor(this.stage.viewport ? this.stage.viewport.y : 0),
            offsetX = Math.floor(p.x + viewX * this.p.speedX),
            offsetY = Math.floor(p.y + viewY * this.p.speedY),
            curX, curY, startX, endX, endY;
        if(p.repeatX) {
          curX = -offsetX % p.repeatW;
          if(curX > 0) { curX -= p.repeatW; }
        } else {
          curX = p.x - viewX;
        }
        if(p.repeatY) {
          curY = -offsetY % p.repeatH;
          if(curY > 0) { curY -= p.repeatH; }
        } else {
          curY = p.y - viewY;
        }

        startX = curX;
        endX = GF.width / Math.abs(scale) / Math.abs(p.scale || 1) + p.repeatW;
        endY = GF.height / Math.abs(scale) / Math.abs(p.scale || 1) + p.repeatH;

        while(curY < endY) {
          curX = startX;
          while(curX < endX) {
            if(sheet) {
              sheet.draw(ctx,curX + viewX,curY + viewY,p.frame);
            } else {
              ctx.drawImage(asset,curX + viewX,curY + viewY);
            }
            curX += p.repeatW;
            if(!p.repeatX) { break; }
          }
          curY += p.repeatH;
          if(!p.repeatY) { break; }
        }
      }
    });

    // Tween Animation
    GF.Tween = GF.Class.extend({
      init: function(entity,properties,duration,easing,options) {
        if(GF._isObject(easing)) { options = easing; easing = GF.Easing.Linear; }
        if(GF._isObject(duration)) { options = duration; duration = 1; }

        this.entity = entity;
        //this.p = (entity instanceof GF.Stage) ? entity.viewport : entity.p;
        this.duration = duration || 1;
        this.time = 0;
        this.options = options || {};
        this.delay = this.options.delay || 0;
        this.easing = easing || this.options.easing || GF.Easing.Linear;

        this.startFrame = GF._loopFrame + 1;
        this.properties = properties;
        this.start = {};
        this.diff = {};
      },

      step: function(dt) {
        var property;

        if(this.startFrame > GF._loopFrame) { return true; }
        if(this.delay >= dt) {
          this.delay -= dt;
          return true;
        }

        if(this.delay > 0) {
          dt -= this.delay;
          this.delay = 0;
        }

        if(this.time === 0) {
          // first time running? Initialize the properties to chaining correctly.
          var entity = this.entity, properties = this.properties;
          this.p = (entity instanceof GF.Stage) ? entity.viewport : entity.p;
          for(property in properties) {
            this.start[property] = this.p[property];
            if(!GF._isUndefined(this.start[property])) {
              this.diff[property] = properties[property] - this.start[property];
            }
          }
        }
        this.time += dt;

        var progress = Math.min(1,this.time / this.duration),
            location = this.easing(progress);

        for(property in this.start) {
          if(!GF._isUndefined(this.p[property])) {
            this.p[property] = this.start[property] + this.diff[property] * location;
          }
        }

        if(progress >= 1) {
          if(this.options.callback) {
            this.options.callback.apply(this.entity);
          }
        }
        return progress < 1;
      }
    });

    // Easing Animation
    GF.Easing = {
      Linear: function (k) { return k; },
      Quadratic: {
        In: function ( k )  { return k * k; },
        Out: function ( k ) {return k * ( 2 - k ); },
        InOut: function ( k ) {
          if ((k *= 2 ) < 1) { return 0.5 * k * k; }
          return -0.5 * (--k * (k - 2) - 1);
        }
      }
    };

    // Tween Component
    GF.component('tween',{
      added: function() {
        this._tweens = [];
        this.entity.on("step",this,"step");
      },
      extend: {
        animate: function(properties,duration,easing,options) {
          this.tween._tweens.push(new GF.Tween(this,properties,duration,easing,options));
          return this;
        },

        chain: function(properties,duration,easing,options) {
          if(GF._isObject(easing)) { options = easing; easing = GF.Easing.Linear; }
          // Chain an animation to the end
          var tweenCnt = this.tween._tweens.length;
          if(tweenCnt > 0) {
            var lastTween = this.tween._tweens[tweenCnt - 1];
            options = options || {};
            options['delay'] = lastTween.duration - lastTween.time + lastTween.delay;
          }

          this.animate(properties,duration,easing,options);
          return this;
        },

        stop: function() {
          this.tween._tweens.length = 0;
          return this;
        }
      },

      step: function(dt) {
        for(var i=0; i < this._tweens.length; i++) {
          if(!this._tweens[i].step(dt)) {
            this._tweens.splice(i,1);
            i--;
          }
        }
      }
    });
  };
};

// Initialize Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineAnim;
} else {
  ocugineAnim(OcugineGF);
}
