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
//  @module OcugineUI
//=======================================================================
var ocugineUI = function(OcugineGF) {
  "use strict";

  // Ocugine Game Framework UI Class
  OcugineGF.UI = function(GF) {
    // Ocugine Touch Required
    if(GF._isUndefined(OcugineGF.Touch)) {
      throw "OcugineGF.UI requires OcugineGF.Touch Module";
    }

    // UI Array
    GF.UI = {};

    // Draw Round Rect
    GF.UI.roundRect = function(ctx, rect) {
      ctx.beginPath();
      ctx.moveTo(-rect.cx + rect.radius, -rect.cy);
      ctx.lineTo(-rect.cx + rect.w - rect.radius, -rect.cy);
      ctx.quadraticCurveTo(-rect.cx + rect.w, -rect.cy, -rect.cx + rect.w, -rect.cy + rect.radius);
      ctx.lineTo(-rect.cx + rect.w, -rect.cy + rect.h - rect.radius);
      ctx.quadraticCurveTo(-rect.cx + rect.w,
                           -rect.cy + rect.h,
                           -rect.cx + rect.w - rect.radius,
                           -rect.cy + rect.h);
      ctx.lineTo(-rect.cx + rect.radius, -rect.cy + rect.h);
      ctx.quadraticCurveTo(-rect.cx, -rect.cy + rect.h, -rect.cx, -rect.cy + rect.h - rect.radius);
      ctx.lineTo(-rect.cx, -rect.cy + rect.radius);
      ctx.quadraticCurveTo(-rect.cx, -rect.cy, -rect.cx + rect.radius, -rect.cy);
      ctx.closePath();
    };

    // Creates a container for UI elements.
    GF.UI.Container = GF.Sprite.extend("UI.Container", {
      init: function(p,defaults) {
        var adjustedP = GF._clone(p||{}),
            match;

        if(p && GF._isString(p.w) && (match = p.w.match(/^[0-9]+%$/))) {
          adjustedP.w = parseInt(p.w,10) * GF.width / 100;
          adjustedP.x = GF.width/2 - adjustedP.w/2;
        }

        if(p && GF._isString(p.h) && (match = p.h.match(/^[0-9]+%$/))) {
          adjustedP.h = parseInt(p.h,10) * GF.height / 100;
          adjustedP.y = GF.height /2 - adjustedP.h/2;
        }

        this._super(GF._defaults(adjustedP,defaults),{
          opacity: 1,
          hidden: false, // Set to true to not show the container
          fill:   null, // Set to color to add background
          highlight:   null, // Set to color to for button
          radius: 5, // Border radius
          stroke: "#000",
          border: false, // Set to a width to show a border
          shadow: false, // Set to true or a shadow offest
          shadowColor: false, // Set to a rgba value for the shadow
          outlineWidth: false, // Set to a width to outline text
          outlineColor: "#000",
          type: GF.SPRITE_NONE
        });

      },

      /**
       Inserts an object into the container.
       The object can later accessed via `children` property of the container.

       @method insert
       @for GF.UI.Container
       @param {GF.GameObject} obj - the Item to insert
       @return the inserted object for chaining
      */
      insert: function(obj) {
        this.stage.insert(obj,this);
        return obj;
      },

      /**
       Fits the containers size depending on its children.

       @method fit
       @for GF.UI.Container
       @param {Number} paddingY - vertical padding
       @param {Number} paddingX - horizontal padding
       @return the inserted object for chaining
      */
      fit: function(paddingY,paddingX) {
        if(this.children.length === 0) { return; }

        if(paddingY === void 0) { paddingY = 0; }
        if(paddingX === void 0) { paddingX = paddingY; }

        var minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        for(var i =0;i < this.children.length;i++) {
          var obj = this.children[i];
          var minObjX = obj.p.x - obj.p.cx,
              minObjY = obj.p.y - obj.p.cy,
              maxObjX = obj.p.x - obj.p.cx + obj.p.w,
              maxObjY = obj.p.y - obj.p.cy + obj.p.h;

          if(minObjX < minX) { minX = minObjX; }
          if(minObjY < minY) { minY = minObjY; }

          if(maxObjX > maxX) { maxX = maxObjX; }
          if(maxObjY > maxY) { maxY = maxObjY; }

        }

        this.p.cx = -minX + paddingX;
        this.p.cy = -minY + paddingY;
        this.p.w = maxX - minX + paddingX * 2;
        this.p.h = maxY - minY + paddingY * 2;

        // Since the original dimensions were changed, update the boundaries so that the collision is calculated correctly
        GF._generatePoints(this, true);
        GF._generateCollisionPoints(this, true);
      },

      /**
       Adds the shadow specified in `p` to the container.

       @method addShadow
       @param {canvas context} ctx - the canvas context
       @for GF.UI.Container
      */
      addShadow: function(ctx) {
        if(this.p.shadow) {
          var shadowAmount = GF._isNumber(this.p.shadow) ? this.p.shadow : 5;
          ctx.shadowOffsetX=shadowAmount;
          ctx.shadowOffsetY=shadowAmount;
          ctx.shadowColor = this.p.shadowColor || "rgba(0,0,50,0.1)";
        }
      },

      /**
       Sets the shadows color to `transparent`.

       @method clearShadow
       @param {canvas context} ctx - the canvas context
       @for GF.UI.Container
      */
      clearShadow: function(ctx) {
        ctx.shadowColor = "transparent";
      },

      /**
       (re)Draws the roundedRect with shadow and border of the container.

       @method drawRadius
       @param {canvas context} ctx - the canvas context
       @for GF.UI.Container
      */
      drawRadius: function(ctx) {
        GF.UI.roundRect(ctx,this.p);
        this.addShadow(ctx);
        ctx.fill();
        if(this.p.border) {
          this.clearShadow(ctx);
          ctx.lineWidth = this.p.border;
          ctx.stroke();
        }
      },

      drawSquare: function(ctx) {
        this.addShadow(ctx);
        if(this.p.fill) {
          ctx.fillRect(-this.p.cx,-this.p.cy,
                        this.p.w,this.p.h);
        }

        if(this.p.border) {
          this.clearShadow(ctx);
          ctx.lineWidth = this.p.border;
          ctx.strokeRect(-this.p.cx,-this.p.cy,
                          this.p.w,this.p.h);
        }
      },

      draw: function(ctx) {
        if(this.p.hidden) { return false; }
        if(!this.p.border && !this.p.fill) { return; }

        ctx.globalAlpha = this.p.opacity;
        if(this.p.frame === 1 && this.p.highlight) {
          ctx.fillStyle = this.p.highlight;
        } else {
          ctx.fillStyle = this.p.fill;
        }
        ctx.strokeStyle = this.p.stroke;

        if(this.p.radius > 0) {
          this.drawRadius(ctx);
        } else {
          this.drawSquare(ctx);
        }

      }
    });

    // Creates a Text-UI element.
    GF.UI.Text = GF.Sprite.extend("UI.Text", {
      init: function(p,defaultProps) {
        this._super(GF._defaults(p||{},defaultProps),{
          type: GF.SPRITE_UI,
          size: 24,
          lineHeight: 1.2,
          align: 'center'
        });

        //this.el = document.createElement("canvas");
        //this.ctx = this.el.getContext("2d");

        if(this.p.label) {
          this.calcSize();
        }

        //this.prerender();
      },

      calcSize: function() {
        var p = this.p;

        this.setFont(GF.ctx);
        this.splitLabel = p.label.split("\n");
        var maxLabel = "";
        p.w = 0;

        for(var i = 0;i < this.splitLabel.length;i++) {
           var metrics = GF.ctx.measureText(this.splitLabel[i]);
          if(metrics.width >  p.w) {
              p.w = metrics.width;
          }
        }

        p.lineHeightPx = p.size * p.lineHeight;
        p.h = p.lineHeightPx * this.splitLabel.length;
        p.halfLeading = 0.5 * p.size * Math.max(0, p.lineHeight - 1);

        p.cy = 0;

        if(p.align === 'center'){
           p.cx = p.w / 2;
           p.points = [
              [ -p.cx, 0],
              [ p.cx, 0],
              [ p.cx, p.h ],
              [ -p.cx, p.h ]
           ];
        } else if (p.align === 'right'){
           p.cx = p.w;
           p.points = [
              [ -p.w, 0],
              [ 0, 0],
              [ 0, p.h ],
              [ -p.w, p.h ]
           ];
        } else {
           p.cx = 0;
           p.points = [
              [ 0, 0],
              [ p.w, 0],
              [ p.w, p.h ],
              [ 0, p.h ]
           ];
        }
      },

      prerender: function() {
        if(this.p.oldLabel === this.p.label) { return; }
        this.p.oldLabel = this.p.label;
        this.calcSize();
        this.el.width = this.p.w;
        this.el.height = this.p.h * 4;
        this.ctx.clearRect(0,0,this.p.w,this.p.h);

        this.ctx.fillStyle = "#FF0";
        this.ctx.fillRect(0,0,this.p.w,this.p.h/2);
        this.setFont(this.ctx);

        this.ctx.fillText(this.p.label,0,0);
      },

      draw: function(ctx) {
        var p = this.p;
         //this.prerender();
        if(p.opacity === 0) { return; }

        if(p.oldLabel !== p.label) { this.calcSize(); }

        this.setFont(ctx);
        if(p.opacity !== void 0) { ctx.globalAlpha = p.opacity; }
        for(var i =0;i<this.splitLabel.length;i++) {
          if(p.outlineWidth) {
            ctx.strokeText(this.splitLabel[i],0, p.halfLeading + i * p.lineHeightPx);
          }
            ctx.fillText(this.splitLabel[i],0, p.halfLeading + i * p.lineHeightPx);
        }
      },

      /**
       Returns the asset of the element

       @method asset
       @for GF.UI.Text
      */
      asset: function() {
        return this.el;
      },

      /**
       Sets the textfont using parameters of `p`.
       Defaults: see Class description!

       @method setFont
       @for GF.UI.Text
      */
      setFont: function(ctx) {
        ctx.textBaseline = "top";
        ctx.font= this.font();
        ctx.fillStyle = this.p.color || "black";
        ctx.textAlign = this.p.align || "left";
        ctx.strokeStyle = this.p.outlineColor || "black";
        ctx.lineWidth = this.p.outlineWidth || 0;
      },

      font: function() {
        if(this.fontString) { return this.fontString; }

        this.fontString = (this.p.weight || "800") + " " +
                          (this.p.size || 24) + "px " +
                          (this.p.family || "Arial");

        return this.fontString;
      }

    });


    // Creates a Button-UI element that can be pressed/touched.
    GF.UI.Button = GF.UI.Container.extend("UI.Button", {
      init: function(p, callback, defaultProps) {
        this._super(GF._defaults(p||{},defaultProps),{
          type: GF.SPRITE_UI | GF.SPRITE_DEFAULT,
          keyActionName: null
        });
        if(this.p.label && (!this.p.w || !this.p.h)) {
          GF.ctx.save();
          this.setFont(GF.ctx);
          var metrics = GF.ctx.measureText(this.p.label);
          GF.ctx.restore();
          if(!this.p.h) {  this.p.h = 24 + 20; }
          if(!this.p.w) { this.p.w = metrics.width + 20; }
        }

        if(isNaN(this.p.cx)) { this.p.cx = this.p.w / 2; }
        if(isNaN(this.p.cy)) { this.p.cy = this.p.h / 2; }
        this.callback = callback;
        this.on('touch',this,"highlight");
        this.on('touchEnd',this,"push");
        if(this.p.keyActionName) {
          GF.input.on(this.p.keyActionName,this,"push");
        }
      },

      highlight: function() {
        if(typeof this.sheet() !== 'undefined' && this.sheet().frames > 1) {
          this.p.frame = 1;
        }
      },

      push: function() {
        this.p.frame = 0;
        if(this.callback) { this.callback(); }
        this.trigger('click');
      },

      draw: function(ctx) {
        this._super(ctx);

        if(this.p.asset || this.p.sheet) {
          GF.Sprite.prototype.draw.call(this,ctx);
        }

        if(this.p.label) {
          ctx.save();
          this.setFont(ctx);
          ctx.fillText(this.p.label,0,0);
          ctx.restore();
        }
      },

      /**
       Sets the textfont using parameters of `p`.
       Defaults: see Class description!

       @method setFont
       @for GF.UI.Button
      */
      setFont: function(ctx) {
        ctx.textBaseline = "middle";
        ctx.font = this.p.font || "400 24px arial";
        ctx.fillStyle = this.p.fontColor || "black";
        ctx.textAlign = "center";
      }

    });

    //  Creates a html-iframe in the html-document.
    GF.UI.IFrame = GF.Sprite.extend("UI.IFrame", {
      init: function(p) {
        this._super(p, { opacity: 1, type: GF.SPRITE_UI | GF.SPRITE_DEFAULT });

        GF.wrapper.style.overflow = "hidden";

        this.iframe = document.createElement("IFRAME");
        this.iframe.setAttribute("src",this.p.url);
        this.iframe.style.position = "absolute";
        this.iframe.style.zIndex = 500;
        this.iframe.setAttribute("width",this.p.w);
        this.iframe.setAttribute("height",this.p.h);
        this.iframe.setAttribute("frameborder",0);

        if(this.p.background) {
          this.iframe.style.backgroundColor = this.p.background;
        }

        GF.wrapper.appendChild(this.iframe);
        this.on("inserted",function(parent) {
          this.positionIFrame();
          parent.on("destroyed",this,"remove");
        });
      },

      positionIFrame: function() {
        var x = this.p.x;
        var y = this.p.y;
        if(this.stage.viewport) {
          x -= this.stage.viewport.x;
          y -= this.stage.viewport.y;
        }

        if(this.oldX !== x || this.oldY !== y || this.oldOpacity !== this.p.opacity) {

          this.iframe.style.top = (y - this.p.cy) + "px";
          this.iframe.style.left = (x - this.p.cx) + "px";
          this.iframe.style.opacity = this.p.opacity;

          this.oldX = x;
          this.oldY = y;
          this.oldOpacity = this.p.opacity;
        }
      },

      step: function(dt) {
        this._super(dt);
        this.positionIFrame();
      },

      remove: function() {
        if(this.iframe) {
          GF.wrapper.removeChild(this.iframe);
          this.iframe = null;
        }
      }
    });

    // Creates a div-Helement in the html-document with given innerHTML.
    GF.UI.HTMLElement = GF.Sprite.extend("UI.HTMLElement", {
      init: function(p) {
        this._super(p, { opacity: 1, type: GF.SPRITE_UI  });

        GF.wrapper.style.overflow = "hidden";

        this.el = document.createElement("div");
        this.el.innerHTML = this.p.html;

        GF.wrapper.appendChild(this.el);
        this.on("inserted",function(parent) {
          this.position();
          parent.on("destroyed",this,"remove");
          parent.on("clear",this,"remove");
        });
      },

      position: function() {
      },

      step: function(dt) {
        this._super(dt);
        this.position();
      },

      remove: function() {
        if(this.el) {
          GF.wrapper.removeChild(this.el);
          this.el= null;
        }
      }
    });

    // Creates a vertical layout
    GF.UI.VerticalLayout = GF.Sprite.extend("UI.VerticalLayout",{


      init: function(p) {
        this.children = [];
        this._super(p, { type: 0 });
      },

      insert: function(sprite) {
        this.stage.insert(sprite,this);
        this.relayout();
        // Bind to destroy
        return sprite;
      },

      relayout: function() {
        var totalHeight = 0;
        for(var i=0;i<this.children.length;i++) {
          totalHeight += this.children[i].p.h || 0;
        }

        // Center?
        var totalSepartion = this.p.h - totalHeight;

        // Make sure all elements have the same space between them
      }
    });

    /* TODO: Other UI Elements */
  };
};

// Initialize Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineUI;
} else {
  ocugineUI(OcugineGF);
}
