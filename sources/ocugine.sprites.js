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
//  @module OcugineSprites
//=======================================================================
var ocugineSprites = function(OcugineGF) {
  "use strict";

  //=======================================================================
  //  @module Ocugine Sprites Module Class
  //=======================================================================
  OcugineGF.Sprites = function(GF) {
    //=======================================================================
    //  Sprite Sheet Class
    //=======================================================================
    GF.Class.extend("SpriteSheet",{
      // Class Constructor
      init: function(name, asset,options) {
        if(!GF.asset(asset)) { throw "Invalid Asset:" + asset; }
        GF._extend(this,{
          name: name,
          asset: asset,
          w: GF.asset(asset).width,
          h: GF.asset(asset).height,
          tileW: 64,
          tileH: 64,
          sx: 0,
          sy: 0,
          spacingX: 0,
          spacingY: 0,
          frameProperties: {}
          });
        if(options) { GF._extend(this,options); }
        // fix for old tilew instead of tileW
        if(this.tilew) {
          this.tileW = this.tilew;
          delete this['tilew'];
        }
        if(this.tileh) {
          this.tileH = this.tileh;
          delete this['tileh'];
        }

        this.cols = this.cols ||
                    Math.floor((this.w + this.spacingX) / (this.tileW + this.spacingX));

        this.frames = this.cols * (Math.floor(this.h/(this.tileH + this.spacingY)));
      },

      // Returns the starting x position of a single frame
      fx: function(frame) {
        return Math.floor((frame % this.cols) * (this.tileW + this.spacingX) + this.sx);
      },

      // Returns the starting y position of a single frame
      fy: function(frame) {
        return Math.floor(Math.floor(frame / this.cols) * (this.tileH + this.spacingY) + this.sy);
      },

      // Draw a single frame at x,y on the provided context
      draw: function(ctx, x, y, frame) {
        if(!ctx) { ctx = GF.ctx; }
        ctx.drawImage(GF.asset(this.asset),
                      this.fx(frame),this.fy(frame),
                      this.tileW, this.tileH,
                      Math.floor(x),Math.floor(y),
                      this.tileW, this.tileH);

      }
    });

    // Sprite Sheets List
    GF.sheets = {};

    // Return a `GF.SpriteSheet` or  create a new sprite sheet
    GF.sheet = function(name,asset,options) {
      if(asset) {
        GF.sheets[name] = new GF.SpriteSheet(name,asset,options);
      } else {
        return GF.sheets[name];
      }
    };

    // Create a number of `GF.SpriteSheet` objects from an image asset and a sprite data JSON asset
    GF.compileSheets = function(imageAsset,spriteDataAsset) {
      var data = GF.asset(spriteDataAsset);
      GF._each(data,function(spriteData,name) {
        GF.sheet(name,imageAsset,spriteData);
      });
    };

    // Sprite Types Params
    GF.SPRITE_NONE     = 0;
    GF.SPRITE_DEFAULT  = 1;
    GF.SPRITE_PARTICLE = 2;
    GF.SPRITE_ACTIVE   = 4;
    GF.SPRITE_FRIENDLY = 8;
    GF.SPRITE_ENEMY    = 16;
    GF.SPRITE_POWERUP  = 32;
    GF.SPRITE_UI       = 64;
    GF.SPRITE_ALL   = 0xFFFF;

    // generate a square set of  `p.points` on an object from `p.w` and `p.h`
    // `p.points` represent the collision points for an object in object coordinates.
    GF._generatePoints = function(obj,force) {
      if(obj.p.points && !force) { return; }
      var p = obj.p,
          halfW = p.w/2,
          halfH = p.h/2;

      p.points = [
        [ -halfW, -halfH ],
        [  halfW, -halfH ],
        [  halfW,  halfH ],
        [ -halfW,  halfH ]
        ];
    };

    // Generate a square set of  `c.points` on an object from the object transform matrix and `p.points`
    // `c.points` represents the collision points of an sprite in world coordinates, scaled, rotate and taking into account any parent transforms.
    GF._generateCollisionPoints = function(obj) {
        if(!obj.matrix && !obj.refreshMatrix) { return; }
        if(!obj.c) { obj.c = { points: [] }; }
        var p = obj.p, c = obj.c;

        if(!p.moved &&
           c.origX === p.x &&
           c.origY === p.y &&
           c.origScale === p.scale &&
           c.origAngle === p.angle) {
            return;
        }

        c.origX = p.x;
        c.origY = p.y;
        c.origScale = p.scale;
        c.origAngle = p.angle;

        obj.refreshMatrix();

        var i;

        // Early out if we don't need to rotate / scale / deal with a container
        if(!obj.container && (!p.scale || p.scale === 1) && p.angle === 0) {
          for(i=0;i<obj.p.points.length;i++) {
            obj.c.points[i] = obj.c.points[i] || [];
            obj.c.points[i][0] = p.x + obj.p.points[i][0];
            obj.c.points[i][1] = p.y + obj.p.points[i][1];
          }
          c.x = p.x; c.y = p.y;
          c.cx = p.cx; c.cy = p.cy;
          c.w = p.w; c.h = p.h;
        } else {
          var container = obj.container || GF._nullContainer;

          c.x = container.matrix.transformX(p.x,p.y);
          c.y = container.matrix.transformY(p.x,p.y);
          c.angle = p.angle + container.c.angle;
          c.scale = (container.c.scale || 1) * (p.scale || 1);

          var minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

          for(i=0;i<obj.p.points.length;i++) {
            if(!obj.c.points[i]) {
              obj.c.points[i] = [];
            }
            obj.matrix.transformArr(obj.p.points[i],obj.c.points[i]);
            var x = obj.c.points[i][0],
            y = obj.c.points[i][1];

            if(x < minX) { minX = x; }
            if(x > maxX) { maxX = x; }
            if(y < minY) { minY = y; }
            if(y > maxY) { maxY = y; }
          }

          if(minX === maxX) { maxX+=1; }
          if(minY === maxY) { maxY+=1; }

          c.cx = c.x - minX;
          c.cy = c.y - minY;

          c.w = maxX - minX;
          c.h = maxY - minY;
        }

        p.moved = false;

        // TODO: Invoke moved on children
        if(obj.children && obj.children.length > 0) {
          GF._invoke(obj.children,"moved");
        }
      };

    //=======================================================================
    //  Basic sprite class - will render either and asset or a frame from a
    //  sprite sheet.
    //=======================================================================
    GF.GameObject.extend("Sprite",{
      // Class CONSTRUCTOR
      init: function(props,defaultProps) {
        this.p = GF._extend({
          x: 0,
          y: 0,
          z: 0,
          opacity: 1,
          angle: 0,
          frame: 0,
          type: GF.SPRITE_DEFAULT | GF.SPRITE_ACTIVE,
          name: '',
          spriteProperties: {}
        },defaultProps);

        this.matrix = new GF.Matrix2D();
        this.children = [];

        GF._extend(this.p,props);

        this.size();
        this.p.id = this.p.id || GF._uniqueId();

        this.refreshMatrix();
      },

      // Resets the width, height and center based on the asset or sprite sheet
      size: function(force) {
        if(force || (!this.p.w || !this.p.h)) {
          if(this.asset()) {
            this.p.w = this.asset().width;
            this.p.h = this.asset().height;
          } else if(this.sheet()) {
            this.p.w = this.sheet().tileW;
            this.p.h = this.sheet().tileH;
          }
        }

        this.p.cx = (force || this.p.cx === void 0) ? (this.p.w / 2) : this.p.cx;
        this.p.cy = (force || this.p.cy === void 0) ? (this.p.h / 2) : this.p.cy;
      },

      // Get or set the asset associate with this sprite
      asset: function(name,resize) {
        if(!name) { return GF.asset(this.p.asset); }

        this.p.asset = name;
        if(resize) {
          this.size(true);
          GF._generatePoints(this,true);
        }
      },

      // Get or set the sheet associate with this sprite
      sheet: function(name,resize) {
        if(!name) { return GF.sheet(this.p.sheet); }

        this.p.sheet = name;
        if(resize) {
          this.size(true);
          GF._generatePoints(this,true);
        }
      },

      // Hide the sprite (render returns without rendering)
      hide: function() {
        this.p.hidden = true;
      },

      // Show the sprite
      show: function() {
        this.p.hidden = false;
      },

      // Set a set of `p` properties on a Sprite
      set: function(properties) {
        GF._extend(this.p,properties);
        return this;
      },

      // Sort Child
      _sortChild: function(a,b) {
        return ((a.p && a.p.z) || -1) - ((b.p && b.p.z) || -1);
      },

      // Flip Args Obj
      _flipArgs: {
        "x":  [ -1,  1],
        "y":  [  1, -1],
        "xy": [ -1, -1]
      },

      // Default render method for the sprite. Don't overload this unless you want to
      // handle all the transform and scale stuff yourself. Rather overload the `draw` method.
      render: function(ctx) {
        var p = this.p;
        if(p.hidden || p.opacity === 0) { return; }
        if(!ctx) { ctx = GF.ctx; }
        this.trigger('predraw',ctx);
        ctx.save();
          if(this.p.opacity !== void 0 && this.p.opacity !== 1) {
            ctx.globalAlpha = this.p.opacity;
          }
          this.matrix.setContextTransform(ctx);
          if(this.p.flip) { ctx.scale.apply(ctx,this._flipArgs[this.p.flip]); }
          this.trigger('beforedraw',ctx);
          this.draw(ctx);
          this.trigger('draw',ctx);
        ctx.restore();
        if(this.p.sort) { this.children.sort(this._sortChild); }
        GF._invoke(this.children,"render",ctx);
        this.trigger('postdraw',ctx);
        if(GF.debug) { this.debugRender(ctx); }
      },

      // Center sprite inside of it's container (or the stage)
      center: function() {
        if(this.container) {
          this.p.x = 0;
          this.p.y = 0;
        } else {
          this.p.x = GF.width / 2;
          this.p.y = GF.height / 2;
        }

      },

      // Draw the asset on the stage. the context passed in is alreay transformed.
      draw: function(ctx) {
        var p = this.p;
        if(p.sheet) {
          this.sheet().draw(ctx,-p.cx,-p.cy,p.frame);
        } else if(p.asset) {
          ctx.drawImage(GF.asset(p.asset),-p.cx,-p.cy);
        } else if(p.color) {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.cx,-p.cy,p.w,p.h);
        }
      },

      // Debug Render
      debugRender: function(ctx) {
        if(!this.p.points) {
          GF._generatePoints(this);
        }
        ctx.save();
        this.matrix.setContextTransform(ctx);
        ctx.beginPath();
        ctx.fillStyle = this.p.hit ? "blue" : "red";
        ctx.strokeStyle = "#FF0000";
        ctx.fillStyle = "rgba(0,0,0,0.5)";

        ctx.moveTo(this.p.points[0][0],this.p.points[0][1]);
        for(var i=0;i<this.p.points.length;i++) {
          ctx.lineTo(this.p.points[i][0],this.p.points[i][1]);
        }
        ctx.lineTo(this.p.points[0][0],this.p.points[0][1]);
        ctx.stroke();
        if(GF.debugFill) { ctx.fill(); }

        ctx.restore();

        if(this.c) {
          var c = this.c;
          ctx.save();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FF00FF";
            ctx.beginPath();
            ctx.moveTo(c.x - c.cx,       c.y - c.cy);
            ctx.lineTo(c.x - c.cx + c.w, c.y - c.cy);
            ctx.lineTo(c.x - c.cx + c.w, c.y - c.cy + c.h);
            ctx.lineTo(c.x - c.cx      , c.y - c.cy + c.h);
            ctx.lineTo(c.x - c.cx,       c.y - c.cy);
            ctx.stroke();
          ctx.restore();
        }
      },

      // Update method is called each step with the time elapsed since the last step.
      // Doesn't do anything other than trigger events, call a `step` method if defined
      // and run update on all its children.
      update: function(dt) {
        this.trigger('prestep',dt);
        if(this.step) { this.step(dt); }
        this.trigger('step',dt);
        GF._generateCollisionPoints(this);
        if(this.stage && this.children.length > 0) {
          this.stage.updateSprites(this.children,dt,true);
        }
        if(this.p.collisions) { this.p.collisions = []; }
      },

      // Regenerates this sprite's transformation matrix
      refreshMatrix: function() {
        var p = this.p;
        this.matrix.identity();
        if(this.container) { this.matrix.multiply(this.container.matrix); }
        this.matrix.translate(p.x,p.y);
        if(p.scale) { this.matrix.scale(p.scale,p.scale); }
        this.matrix.rotateDeg(p.angle);
      },

      // Marks a sprite as having been moved
      moved: function() {
        this.p.moved = true;
      }
    });

    //=======================================================================
    //  Simple sprite that adds in basic newtonian physics on each step:
    //    p.vx += p.ax * dt;
    //    p.vy += p.ay * dt;
    //
    //    p.x += p.vx * dt;
    //    p.y += p.vy * dt;
    //=======================================================================
    GF.Sprite.extend("MovingSprite",{
      init: function(props,defaultProps) {
        this._super(GF._extend({
          vx: 0,
          vy: 0,
          ax: 0,
          ay: 0
        },props),defaultProps);
     },
     step: function(dt) {
       var p = this.p;

       p.vx += p.ax * dt;
       p.vy += p.ay * dt;

       p.x += p.vx * dt;
       p.y += p.vy * dt;
     }
   });

    // Return Game Framework Instance
    return GF;
  };
};

// initialize module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineSprites;
} else {
  ocugineSprites(OcugineGF);
}
