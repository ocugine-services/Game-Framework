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
//  @module OcugineScenes
//=======================================================================
var ocugineScenes = function(OcugineGF) {
    "use strict";

   //=======================================================================
   //  OcugineGF Scenes Module Class
   //=======================================================================
   OcugineGF.Scenes = function(GF) {
     // Scenes and Stages List
     GF.scenes = {};
     GF.stages = [];

      // Basic scene class, consisting primarily of a scene function
      // and some options that are passed to the stage.
      // Should be instantiated by calling `GF.scene` not new
      GF.Class.extend('Scene',{
        init: function(sceneFunc,opts) {
          this.opts = opts || {};
          this.sceneFunc = sceneFunc;
        }
      });

      // Set up a new scene or return an existing scene. If you don't pass in `sceneFunc`,
      // it'll return a scene otherwise it'll create a new one.
      GF.scene = function(name,sceneFunc,opts) {
        if(sceneFunc === void 0) {
          return GF.scenes[name];
        } else {
          if(GF._isFunction(sceneFunc)) {
            sceneFunc = new GF.Scene(sceneFunc,opts);
            sceneFunc.name = name;
          }
          GF.scenes[name] = sceneFunc;
          return sceneFunc;
        }
      };

      // Null Container
      GF._nullContainer = {
        c: {
          x: 0,
          y: 0,
          angle: 0,
          scale: 1
        },
        matrix: GF.matrix2d()
      };

      //=======================================================================
      //  SAT collision detection between two objects
      //  This is sort of a black box - use the methods on stage like
      //  `search` and `collide` to run the collision system.
      //=======================================================================
      GF.collision = (function() {
        var normalX, normalY,
            offset = [ 0,0 ],
            result1 = { separate: [] },
            result2 = { separate: [] };

        // Calculate Normal
        function calculateNormal(points,idx) {
          var pt1 = points[idx],
              pt2 = points[idx+1] || points[0];

          normalX = -(pt2[1] - pt1[1]);
          normalY = pt2[0] - pt1[0];

          var dist = Math.sqrt(normalX*normalX + normalY*normalY);
          if(dist > 0) {
            normalX /= dist;
            normalY /= dist;
          }
        }

        function dotProductAgainstNormal(point) {
          return (normalX * point[0]) + (normalY * point[1]);
        }

        // Collide
        function collide(o1,o2,flip) {
          var min1,max1,
              min2,max2,
              d1, d2,
              offsetLength,
              tmp, i, j,
              minDist, minDistAbs,
              shortestDist = Number.POSITIVE_INFINITY,
              collided = false,
              p1, p2;

          var result = flip ? result2 : result1;

          offset[0] = 0; //o1.x + o1.cx - o2.x - o2.cx;
          offset[1] = 0; //o1.y + o1.cy - o2.y - o2.cy;

          // If we have a position matrix, just use those points,
          if(o1.c) {
            p1 = o1.c.points;
          } else {
            p1 = o1.p.points;
            offset[0] += o1.p.x;
            offset[1] += o1.p.y;
          }

          if(o2.c) {
            p2 = o2.c.points;
          } else {
            p2 = o2.p.points;
            offset[0] += -o2.p.x;
            offset[1] += -o2.p.y;
          }

          o1 = o1.p;
          o2 = o2.p;


          for(i = 0;i<p1.length;i++) {
            calculateNormal(p1,i);

            min1 = dotProductAgainstNormal(p1[0]);
            max1 = min1;

            for(j = 1; j<p1.length;j++) {
              tmp = dotProductAgainstNormal(p1[j]);
              if(tmp < min1) { min1 = tmp; }
              if(tmp > max1) { max1 = tmp; }
            }

            min2 = dotProductAgainstNormal(p2[0]);
            max2 = min2;

            for(j = 1;j<p2.length;j++) {
              tmp = dotProductAgainstNormal(p2[j]);
              if(tmp < min2) { min2 = tmp; }
              if(tmp > max2) { max2 = tmp; }
            }

            offsetLength = dotProductAgainstNormal(offset);
            min1 += offsetLength;
            max1 += offsetLength;

            d1 = min1 - max2;
            d2 = min2 - max1;

            if(d1 > 0 || d2 > 0) { return null; }

            minDist = (max2 - min1) * -1;
            if(flip) { minDist *= -1; }

            minDistAbs = Math.abs(minDist);

            if(minDistAbs < shortestDist) {
              result.distance = minDist;
              result.magnitude = minDistAbs;
              result.normalX = normalX;
              result.normalY = normalY;

              if(result.distance > 0) {
                result.distance *= -1;
                result.normalX *= -1;
                result.normalY *= -1;
              }

              collided = true;
              shortestDist = minDistAbs;
            }
          }

          // Do return the actual collision
          return collided ? result : null;
        }

        // SAT Collision
        function satCollision(o1,o2) {
          var result1, result2, result;

          if(!o1.p.points) { GF._generatePoints(o1); }
          if(!o2.p.points) { GF._generatePoints(o2); }

          result1 = collide(o1,o2);
          if(!result1) { return false; }

          result2 = collide(o2,o1,true);
          if(!result2) { return false; }

          result = (result2.magnitude < result1.magnitude) ? result2 : result1;

          if(result.magnitude === 0) { return false; }
          result.separate[0] = result.distance * result.normalX;
          result.separate[1] = result.distance * result.normalY;

          return result;
        }

        // Return SAT Collision
        return satCollision;
      }());

      //=======================================================================
      //  Check for the overlap of the boudning boxes of two Sprites
      //=======================================================================
      GF.overlap = function(o1,o2) {
        var c1 = o1.c || o1.p || o1;
        var c2 = o2.c || o2.p || o2;
        var o1x = c1.x - (c1.cx || 0),
            o1y = c1.y - (c1.cy || 0);
        var o2x = c2.x - (c2.cx || 0),
            o2y = c2.y - (c2.cy || 0);
        return !((o1y+c1.h<o2y) || (o1y>o2y+c2.h) ||
                 (o1x+c1.w<o2x) || (o1x>o2x+c2.w));
      };

      //=======================================================================
      // Base stage class, responsible for managing sets of sprites.
      // `GF.Stage`'s aren't generally instantiated directly, but rather are
      //  created automatically when you call `GF.stageScene('sceneName')`
      //=======================================================================
      GF.Stage = GF.GameObject.extend({
        // Should know whether or not the stage is paused
        defaults: {
          sort: false,
          gridW: 400,
          gridH: 400,
          x: 0,
          y: 0
        },

        init: function(scene,opts) {
          this.scene = scene;
          this.items = [];
          this.lists = {};
          this.index = {};
          this.removeList = [];
          this.grid = {};
          this._collisionLayers = [];
          this.time = 0;
          this.defaults['w'] = GF.width;
          this.defaults['h'] = GF.height;
          this.options = GF._extend({},this.defaults);
          if(this.scene)  {
            GF._extend(this.options,scene.opts);
          }
          if(opts) { GF._extend(this.options,opts); }


          if(this.options.sort && !GF._isFunction(this.options.sort)) {
              this.options.sort = function(a,b) { return ((a.p && a.p.z) || -1) - ((b.p && b.p.z) || -1); };
          }
        },

        destroyed: function() {
          this.invoke("debind");
          this.trigger("destroyed");
        },

        loadScene: function() {
          if(this.scene)  {
            this.scene.sceneFunc(this);
          }
        },

        loadAssets: function(asset) {
          var assetArray = GF._isArray(asset) ? asset : GF.asset(asset);
          for(var i=0;i<assetArray.length;i++) {
            var spriteClass = assetArray[i][0];
            var spriteProps = assetArray[i][1];
            this.insert(new GF[spriteClass](spriteProps));
          }
        },

        each: function(callback) {
          for(var i=0,len=this.items.length;i<len;i++) {
            callback.call(this.items[i],arguments[1],arguments[2]);
          }
        },

        invoke: function(funcName) {
          for(var i=0,len=this.items.length;i<len;i++) {
            this.items[i][funcName].call(
              this.items[i],arguments[1],arguments[2]
            );
          }
        },

        detect: function(func) {
          for(var i = this.items.length-1;i >= 0; i--) {
            if(func.call(this.items[i],arguments[1],arguments[2],arguments[3])) {
              return this.items[i];
            }
          }
          return false;
        },

        identify: function(func) {
          var result;
          for(var i = this.items.length-1;i >= 0; i--) {
            if(result = func.call(this.items[i],arguments[1],arguments[2],arguments[3])) {
              return result;
            }
          }
          return false;
        },

        find: function(id) {
          return this.index[id];
        },

        addToLists: function(lists,object) {
          for(var i=0;i<lists.length;i++) {
            this.addToList(lists[i],object);
          }
        },

        addToList: function(list, itm) {
          if(!this.lists[list]) { this.lists[list] = []; }
          this.lists[list].push(itm);
        },

        removeFromLists: function(lists, itm) {
          for(var i=0;i<lists.length;i++) {
            this.removeFromList(lists[i],itm);
          }
        },

        removeFromList: function(list, itm) {
          var listIndex = this.lists[list].indexOf(itm);
          if(listIndex !== -1) {
            this.lists[list].splice(listIndex,1);
          }
        },

        insert: function(itm,container) {
          this.items.push(itm);
          itm.stage = this;
          itm.container = container;
          if(container) {
            container.children.push(itm);
          }

          itm.grid = {};


          // Make sure we have a square of collision points
          GF._generatePoints(itm);
          GF._generateCollisionPoints(itm);


          if(itm.className) { this.addToList(itm.className, itm); }
          if(itm.activeComponents) { this.addToLists(itm.activeComponents, itm); }

          if(itm.p) {
            this.index[itm.p.id] = itm;
          }
          this.trigger('inserted',itm);
          itm.trigger('inserted',this);

          this.regrid(itm);
          return itm;
        },

        remove: function(itm) {
          this.delGrid(itm);
          this.removeList.push(itm);
        },

        forceRemove: function(itm) {
          var idx =  this.items.indexOf(itm);
          if(idx !== -1) {
            this.items.splice(idx,1);

            if(itm.className) { this.removeFromList(itm.className,itm); }
            if(itm.activeComponents) { this.removeFromLists(itm.activeComponents,itm); }
            if(itm.container) {
              var containerIdx = itm.container.children.indexOf(itm);
              if(containerIdx !== -1) {
                itm.container.children.splice(containerIdx,1);
              }
            }

            if(itm.destroy) { itm.destroy(); }
            if(itm.p.id) {
              delete this.index[itm.p.id];
            }
            this.trigger('removed',itm);
          }
        },

        pause: function() {
          this.paused = true;
        },

        unpause: function() {
          this.paused = false;
        },

        _gridCellCheck: function(type,id,obj,collisionMask) {
          if(GF._isUndefined(collisionMask) || collisionMask & type) {
            var obj2 = this.index[id];
            if(obj2 && obj2 !== obj && GF.overlap(obj,obj2)) {
              var col= GF.collision(obj,obj2);
              if(col) {
                col.obj = obj2;
                return col;
              } else {
                return false;
              }
            }
          }
        },

        gridTest: function(obj,collisionMask) {
          var grid = obj.grid, gridCell, col;

          for(var y = grid.Y1;y <= grid.Y2;y++) {
            if(this.grid[y]) {
              for(var x = grid.X1;x <= grid.X2;x++) {
                gridCell = this.grid[y][x];
                if(gridCell) {
                  col = GF._detect(gridCell,this._gridCellCheck,this,obj,collisionMask);
                  if(col) { return col; }
                }
              }
            }
          }
          return false;
        },

        collisionLayer: function(layer) {
          this._collisionLayers.push(layer);
          layer.collisionLayer = true;
          return this.insert(layer);
        },

        _collideCollisionLayer: function(obj,collisionMask) {
          var col;

          for(var i = 0,max = this._collisionLayers.length;i < max;i++) {
            var layer = this._collisionLayers[i];
            if(layer.p.type & collisionMask) {
              col = layer.collide(obj);
              if(col) { col.obj = layer;  return col; }
            }
          }
          return false;
        },

        search: function(obj,collisionMask) {
          var col;

          // If the object doesn't have a grid, regrid it
          // so we know where to search
          // and skip adding it to the grid only if it's not on this stage
          if(!obj.grid) { this.regrid(obj,obj.stage !== this); }

          collisionMask = GF._isUndefined(collisionMask) ? (obj.p && obj.p.collisionMask) : collisionMask;

          col = this._collideCollisionLayer(obj,collisionMask);
          col =  col || this.gridTest(obj,collisionMask);
          return col;
        },

        _locateObj: {
          p: {
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
            w: 1,
            h: 1
          }, grid: {}
        },

        locate: function(x,y,collisionMask) {
          var col = null;

          this._locateObj.p.x = x;
          this._locateObj.p.y = y;

          this.regrid(this._locateObj,true);

          col = this._collideCollisionLayer(this._locateObj,collisionMask);
          col =  col || this.gridTest(this._locateObj,collisionMask);

          if(col && col.obj) {
            return col.obj;
          } else {
            return false;
          }

        },

        collide: function(obj,options) {
          var col, col2, collisionMask,
              maxCol, curCol, skipEvents;
          if(GF._isObject(options)) {
            collisionMask = options.collisionMask;
            maxCol = options.maxCol;
            skipEvents = options.skipEvents;
          } else {
            collisionMask = options;
          }
          collisionMask = GF._isUndefined(collisionMask) ? (obj.p && obj.p.collisionMask) : collisionMask;
          maxCol = maxCol || 3;


          GF._generateCollisionPoints(obj);
          this.regrid(obj);

          curCol = maxCol;
          while(curCol > 0 && (col = this._collideCollisionLayer(obj,collisionMask))) {
            if(!skipEvents) {
              obj.trigger('hit',col);
              obj.trigger('hit.collision',col);
            }
            GF._generateCollisionPoints(obj);
            this.regrid(obj);
            curCol--;
          }

          curCol = maxCol;
          while(curCol > 0 && (col2 = this.gridTest(obj,collisionMask))) {
            obj.trigger('hit',col2);
            obj.trigger('hit.sprite',col2);

            // Do the recipricol collision
            // TODO: extract
            if(!skipEvents) {
              var obj2 = col2.obj;
              col2.obj = obj;
              col2.normalX *= -1;
              col2.normalY *= -1;
              col2.distance = 0;
              col2.magnitude = 0;
              col2.separate[0] = 0;
              col2.separate[1] = 0;


              obj2.trigger('hit',col2);
              obj2.trigger('hit.sprite',col2);
            }

            GF._generateCollisionPoints(obj);
            this.regrid(obj);
            curCol--;
          }

          return col2 || col;
        },

        delGrid: function(item) {
          var grid = item.grid;

          for(var y = grid.Y1;y <= grid.Y2;y++) {
            if(this.grid[y]) {
              for(var x = grid.X1;x <= grid.X2;x++) {
                if(this.grid[y][x]) {
                delete this.grid[y][x][item.p.id];
                }
              }
            }
          }
        },

        addGrid: function(item) {
          var grid = item.grid;

          for(var y = grid.Y1;y <= grid.Y2;y++) {
            if(!this.grid[y]) { this.grid[y] = {}; }
            for(var x = grid.X1;x <= grid.X2;x++) {
              if(!this.grid[y][x]) { this.grid[y][x] = {}; }
              this.grid[y][x][item.p.id] = item.p.type;
            }
          }

        },

        regrid: function(item,skipAdd) {
          if(item.collisionLayer) { return; }
          item.grid = item.grid || {};

          var c = item.c || item.p;

          var gridX1 = Math.floor((c.x - c.cx) / this.options.gridW),
              gridY1 = Math.floor((c.y - c.cy) / this.options.gridH),
              gridX2 = Math.floor((c.x - c.cx + c.w) / this.options.gridW),
              gridY2 = Math.floor((c.y - c.cy + c.h) / this.options.gridH),
              grid = item.grid;

          if(grid.X1 !== gridX1 || grid.X2 !== gridX2 ||
             grid.Y1 !== gridY1 || grid.Y2 !== gridY2) {

             if(grid.X1 !== void 0) { this.delGrid(item); }
             grid.X1 = gridX1;
             grid.X2 = gridX2;
             grid.Y1 = gridY1;
             grid.Y2 = gridY2;

             if(!skipAdd) { this.addGrid(item); }
          }
        },

        markSprites: function(items,time) {
          var viewport = this.viewport,
              scale = viewport ? viewport.scale : 1,
              x = viewport ? viewport.x : 0,
              y = viewport ? viewport.y : 0,
              viewW = GF.width / scale,
              viewH = GF.height / scale,
              gridX1 = Math.floor(x / this.options.gridW),
              gridY1 = Math.floor(y / this.options.gridH),
              gridX2 = Math.floor((x + viewW) / this.options.gridW),
              gridY2 = Math.floor((y + viewH) / this.options.gridH),
              gridRow, gridBlock;

          for(var iy=gridY1; iy<=gridY2; iy++) {
            if((gridRow = this.grid[iy])) {
              for(var ix=gridX1; ix<=gridX2; ix++) {
                if((gridBlock = gridRow[ix])) {
                  for(var id in gridBlock) {
                    if(this.index[id]) {
                      this.index[id].mark = time;
                      if(this.index[id].container) { this.index[id].container.mark = time; }
                    }
                  }
                }
              }
            }
          }
        },

        updateSprites: function(items,dt,isContainer) {
          var item;

          for(var i=0,len=items.length;i<len;i++) {
            item = items[i];
            // If set to visible only, don't step if set to visibleOnly
            if(!isContainer && (item.p.visibleOnly && (!item.mark || item.mark < this.time))) { continue; }

            if(isContainer || !item.container) {
              item.update(dt);
              GF._generateCollisionPoints(item);
              this.regrid(item);
            }
          }
        },

        step:function(dt) {
          if(this.paused) { return false; }

          this.time += dt;
          this.markSprites(this.items,this.time);

          this.trigger("prestep",dt);
          this.updateSprites(this.items,dt);
          this.trigger("step",dt);

          if(this.removeList.length > 0) {
            for(var i=0,len=this.removeList.length;i<len;i++) {
              this.forceRemove(this.removeList[i]);
            }
            this.removeList.length = 0;
          }

          this.trigger('poststep',dt);
        },

        hide: function() {
          this.hidden = true;
        },

        show: function() {
          this.hidden = false;
        },

        stop: function() {
          this.hide();
          this.pause();
        },

        start: function() {
          this.show();
          this.unpause();
        },

        render: function(ctx) {
          if(this.hidden) { return false; }
          if(this.options.sort) {
            this.items.sort(this.options.sort);
          }
          this.trigger("prerender",ctx);
          this.trigger("beforerender",ctx);

          for(var i=0,len=this.items.length;i<len;i++) {
            var item = this.items[i];
            // Don't render sprites with containers (sprites do that themselves)
            // Also don't render if not onscreen
            if(!item.container && (item.p.renderAlways || item.mark >= this.time)) {
              item.render(ctx);
            }
          }
          this.trigger("render",ctx);
          this.trigger("postrender",ctx);
        }
      });

      GF.activeStage = 0;
      GF.StageSelector = GF.Class.extend({
        emptyList: [],

        init: function(stage,selector) {
          this.stage = stage;
          this.selector = selector;

          // Generate an object list from the selector
          // TODO: handle array selectors
          this.items = this.stage.lists[this.selector] || this.emptyList;
          this.length = this.items.length;
        },

        each: function(callback) {
          for(var i=0,len=this.items.length;i<len;i++) {
            callback.call(this.items[i],arguments[1],arguments[2]);
          }
          return this;
        },

        invoke: function(funcName) {
          for(var i=0,len=this.items.length;i<len;i++) {
            this.items[i][funcName].call(
              this.items[i],arguments[1],arguments[2]
            );
          }
          return this;
        },

        trigger: function(name,params) {
          this.invoke("trigger",name,params);
        },

        destroy: function() {
          this.invoke("destroy");
        },

        detect: function(func) {
          for(var i = 0,val=null, len=this.items.length; i < len; i++) {
            if(func.call(this.items[i],arguments[1],arguments[2])) {
              return this.items[i];
            }
          }
          return false;
        },

        identify: function(func) {
          var result = null;
          for(var i = 0,val=null, len=this.items.length; i < len; i++) {
            if(result = func.call(this.items[i],arguments[1],arguments[2])) {
              return result;
            }
          }
          return false;

        },

        // This hidden utility method extends
        // and object's properties with a source object.
        // Used by the p method to set properties.
        _pObject: function(source) {
          GF._extend(this.p,source);
        },

        _pSingle: function(property,value) {
          this.p[property] = value;
        },

        set: function(property, value) {
          // Is value undefined
          if(value === void 0) {
            this.each(this._pObject,property);
          } else {
            this.each(this._pSingle,property,value);
          }

          return this;
        },

        at: function(idx) {
          return this.items[idx];
        },

        first: function() {
          return this.items[0];
        },

        last: function() {
          return this.items[this.items.length-1];
        }

      });

      GF.select = function(selector,scope) {
        scope = (scope === void 0) ? GF.activeStage : scope;
        scope = GF.stage(scope);
        if(GF._isNumber(selector)) {
          return scope.index[selector];
        } else {
          return new GF.StageSelector(scope,selector);
        }
      };

      // Returns the default or currently active stage.
      GF.stage = function(num) {
        num = (num === void 0) ? GF.activeStage : num;
        return GF.stages[num];
      };

     //  Stages a scene. `num` is like a z-index. Higher numbered stages render on top of lower numbered stages!
      GF.stageScene = function(scene,num,options) {
        if(GF._isString(scene)) {
          scene = GF.scene(scene);
        }

        if(GF._isObject(num)) {
          options = num;
          num = GF._popProperty(options,"stage") || (scene && scene.opts.stage) || 0;
        }

        options = GF._clone(options);

        var StageClass = (GF._popProperty(options,"stageClass")) ||
                         (scene && scene.opts.stageClass) || GF.Stage;

        num = GF._isUndefined(num) ? ((scene && scene.opts.stage) || 0) : num;

        // Clean up an existing stage if necessary
        if(GF.stages[num]) {
          GF.stages[num].destroy();
        }

        // Make this this the active stage and initialize the stage,
        // calling loadScene to popuplate the stage if we have a scene.
        GF.activeStage = num;
        var stage = GF.stages[num] = new StageClass(scene,options);

        // Load an assets object array
        if(stage.options.asset) {
          stage.loadAssets(stage.options.asset);
        }

        if(scene) {
          stage.loadScene();
        }
        GF.activeStage = 0;

        // If there's no loop active, run the default stageGameLoop
        if(!GF.loop) {
          GF.gameLoop(GF.stageGameLoop);
        }

        // Finally return the stage to the user for use if needed
        return stage;
      };

      GF.stageStepLoop = function(dt) {
        var i,len,stage;
        if(dt < 0) { dt = 1.0/60; }
        if(dt > 1/15) { dt  = 1.0/15; }
        for(i =0,len=GF.stages.length;i<len;i++) {
          GF.activeStage = i;
          stage = GF.stage();
          if(stage) {
            stage.step(dt);
          }
        }

        GF.activeStage = 0;
      };

      GF.stageRenderLoop = function() {
        if(GF.ctx) { GF.clear(); }
        for(var i =0,len=GF.stages.length;i<len;i++) {
          GF.activeStage = i;
          var stage = GF.stage();
          if(stage) {
            stage.render(GF.ctx);
          }
        }
        if(GF.input && GF.ctx) { GF.input.drawCanvas(GF.ctx); }
        GF.activeStage = 0;
      };

      GF.stageGameLoop = function(dt) {
        GF.stageStepLoop(dt);
        GF.stageRenderLoop();
      };

      //  Destroys the stage with index `num`.
      GF.clearStage = function(num) {
        if(GF.stages[num]) {
          GF.stages[num].destroy();
          GF.stages[num] = null;
        }
      };

      // Destroys all stages.
      GF.clearStages = function() {
        for(var i=0,len=GF.stages.length;i<len;i++) {
          if(GF.stages[i]) { GF.stages[i].destroy(); }
        }
        GF.stages.length = 0;
      };
    };
};

// Init module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineScenes;
} else {
  ocugineScenes(OcugineGF);
}
