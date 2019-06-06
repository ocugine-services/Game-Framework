//=======================================================================
//  Ocugine Game Framework
//  2019 (c) Ocugine Services (Intelligent Solutions, Inc.)
//
//  THIS IS A CORE OF FULL-FEATURED GAME ENGINE (CONSTRUCTOR):
//  https://engine.ocugine.pro/
//
//  Documentation:
//  https://docs.ocugine.pro/en/
//
//  The code in `ocugine.core.js` defines the base `OcugineGF()` method.
//  This method create an instance of the game engine (framework).
//  The basic core doesn't do a whole lot - it provides an architecture
//  for extensions, game loop and bindings support. You can use an
//  exsiting canvas context.
//
//  Based on Quintus Game Engine
//
//  Most of the game-specific functionality is in the various of other
//  modules:
//  * `ocugine.input.js` - `Input` module for user input via keyboard, touch and etc.
//  * `ocugine.sprites.js` - `Sprites` module.
//  * `ocugine.scenes.js` - `Scenes` module.
//  * `ocugine.animations.js` - `Animations` module
//=======================================================================
//=======================================================================
//  @module Ocugine
//=======================================================================
var ocugineCore = function(exportTarget,key) {
    "use strict";

    //=======================================================================
    //  Ocugine Game Framework top-level factory wrapper.
    //  Creates new instances of the framework by calling:
    //
    //    var game = OcugineGF({ /* Some Params */ });
    //
    //  Or use initial setup methods. All returns the `OGF` object:
    //    var game = OcugineGF()
    //                .include("Input,Sprites,Scenes,Web")
    //                .setup("ocugine", {maximize: true})
    //                .controls();
    //
    //  Also you can use multiple game instances:
    //    var game1 = OcugineGF(), game2 = OcugineGF();
    //=======================================================================
    //=======================================================================
    //  @class OcugineGF
    //=======================================================================
    var OcugineGF = exportTarget[key] = function(opts) {
      //=======================================================================
      //  @method         GF
      //  @for            OcugineGF
      //
      //  Like in jQuery - returned `GF` object. It's actually a method
      //  that calls `GF.select`.
      //
      //  Usage Example:
      //    var game = OcugineGF().include("Sprites, Scenes");
      //    /* Game code */
      //    GF("Enemy1").p({ angry: true });
      //=======================================================================
      var GF = function(selector,scope,options) {
        return GF.select(selector,scope,options);
      };

      //=======================================================================
      //  @method         GF.select
      //  @for            OcugineGF
      //
      //  Default no-op select method. Replaced with the OcugineGF.Scene class
      //=======================================================================
      GF.select = function() {};

      //=======================================================================
      //  @method         GF.include
      //  @params         {string} mod - A comma separated list of module names
      //  @returns        {OcugineGF} - instance for chaining
      //  @for            OcugineGF
      //
      //  Syntax for including other modules into OcugineGF, can accept a
      //  comma-separated list of strings, an array of strings, or an array
      //  of actual objects. Example:
      //    GF.include("Input, Sprites, Scenes")
      //=======================================================================
      GF.include = function(mod) {
        GF._each(GF._normalizeArg(mod),function(name) {
          var m = OcugineGF[name] || name;
          if(!GF._isFunction(m)) { throw "Invalid Module:" + name; }
          m(GF);
        });
        return GF;
      };

      //=======================================================================
      //  Internal Methods for Game Framework
      //=======================================================================
      // Normalize Arguments from string to array
      GF._normalizeArg = function(arg) {
        if(GF._isString(arg)) {
          arg = arg.replace(/\s+/g,'').split(",");
        }
        if(!GF._isArray(arg)) {
          arg = [ arg ];
        }
        return arg;
      };

      // Extend Class
      GF._extend = function(dest,source) {
        if(!source) { return dest; }
        for (var prop in source) {
          dest[prop] = source[prop];
        }
        return dest;
      };

      // Clone Object
      GF._clone = function(obj) {
        return GF._extend({},obj);
      };

      // Default Settings initialization method
      GF._defaults = function(dest,source) {
        if(!source) { return dest; }
        for (var prop in source) {
          if(dest[prop] === void 0) {
            dest[prop] = source[prop];
          }
        }
        return dest;
      };

      // Shortcut for hasOwnProperty
      GF._has = function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      };

      // Check if something is a string
      GF._isString = function(obj) {
        return typeof obj === "string";
      };

      // Check if something is a number
      GF._isNumber = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Number]';
      };

      // Check if something is a function
      GF._isFunction = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
      };

      // Check if something is an Object
      GF._isObject = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
      };

      // Check if something is an Array
      GF._isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
      };

      // Check if something is undefined
      GF._isUndefined = function(obj) {
        return obj === void 0;
      };

      // Removes a property from an object and returns it if it exists
      GF._popProperty = function(obj,property) {
        var val = obj[property];
        delete obj[property];
        return val;
      };

      // Basic iteration method. This can often be a performance
      // handicap when the callback iterator is created inline,
      // as this leads to lots of functions that need to be GC'd.
      // Better is to define the iterator as a private method so.
      // Uses the built in `forEach` method
      GF._each = function(obj,iterator,context) {
        if (obj == null) { return; }
        if (obj.forEach) {
          obj.forEach(iterator,context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            iterator.call(context, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      };

      // Invoke the named property on each element of the array
      GF._invoke = function(arr,property,arg1,arg2) {
        if (arr === null) { return; }
        for (var i = 0, l = arr.length; i < l; i++) {
          arr[i][property](arg1,arg2);
        }
      };

      // Basic detection method, returns the first instance where the
      // iterator returns truthy.
      GF._detect = function(obj,iterator,context,arg1,arg2) {
        var result;
        if (obj === null) { return; }
        if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            result = iterator.call(context, obj[i], i, arg1,arg2);
            if(result) { return result; }
          }
          return false;
        } else {
          for (var key in obj) {
            result = iterator.call(context, obj[key], key, arg1,arg2);
            if(result) { return result; }
          }
          return false;
        }
      };

      // Returns a new Array with entries set to the return value of the iterator.
      GF._map = function(obj, iterator, context) {
        var results = [];
        if (obj === null) { return results; }
        if (obj.map) { return obj.map(iterator, context); }
        GF._each(obj, function(value, index, list) {
          results[results.length] = iterator.call(context, value, index, list);
        });
        if (obj.length === +obj.length) { results.length = obj.length; }
        return results;
      };

      // Returns a sorted copy of unique array elements with null removed
      GF._uniq = function(arr) {
        arr = arr.slice().sort();
        var output = [];
        var last = null;
        for(var i=0;i<arr.length;i++) {
          if(arr[i] !== void 0 && last !== arr[i]) {
            output.push(arr[i]);
          }
          last = arr[i];
        }
        return output;
      };

      // Returns a new array with the same entries as the source but in a random order.
      GF._shuffle = function(obj) {
        var shuffled = [], rand;
        GF._each(obj, function(value, index, list) {
          rand = Math.floor(Math.random() * (index + 1));
          shuffled[index] = shuffled[rand];
          shuffled[rand] = value;
        });
        return shuffled;
      };

      // Return an object's keys as a new Array
      GF._keys = Object.keys || function(obj) {
        if(GF._isObject(obj)) { throw new TypeError('Invalid object'); }
        var keys = [];
        for (var key in obj) { if (GF._has(obj, key)) { keys[keys.length] = key; } }
        return keys;
      };

      // Return an array in the range from start to stop
      GF._range = function(start,stop,step) {
        step = step || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while(idx < len) {
          range[idx++] = start;
          start += step;
        }
        return range;
      };

      // Return a new unique identifier
      var idIndex = 0;
      GF._uniqueId = function() {
        return idIndex++;
      };

      //=======================================================================
      //  Options
      //  Default game framework options defining the paths
      //  where assets should be found relative to the base HTML file. As
      //  well as a couple of other options.
      //
      //  These can be overriden by passing in options to the `OcugineGF()`
      //  factory method, for example:
      //    var game = OcugineGF({ imagePath: "/assets/images/" });
      //=======================================================================
      GF.options = {
        imagePath: "images/",
        audioPath: "audio/",
        dataPath:  "data/",
        audioSupported: [ 'mp3','ogg' ],
        sound: true,
        frameTimeLimit: 100,
        autoFocus: true
      };
      if(opts) { GF._extend(GF.options,opts); }

      // Working with frames
      GF.scheduleFrame = function(callback) {
        return window.requestAnimationFrame(callback);
      };
      GF.cancelFrame = function(loop) {
        window.cancelAnimationFrame(loop);
      };

      //=======================================================================
      //  Game Loop
      //  By default the engine doesn't start a game loop until you actually
      //  tell it to. Usually the loop is started the first time you call
      //  `GF.stageScene`, but if you aren't using the `Scenes` module you
      //  can explicitly start the game loop yourself and control **exactly**
      //  what the engine does each cycle. For example:
      //    var game = OcugineGF().setup();
      //    var player = new GF.Sprite({ /* Sprite Settings */ });
      //    game.gameLoop(function(dt) {
      //      game.clear();
      //      player.step(dt);
      //      player.draw(GF.ctx);
      //    });
      //
      //    The callback will be called with fraction of a second that has
      //    elapsed since the last call to the loop method.
      //=======================================================================
      GF.gameLoop = function(callback) {
        GF.lastGameLoopFrame = new Date().getTime();
        GF.loop = true;
        GF._loopFrame = 0;

        // Game Loop Callback Wrapper
        GF.gameLoopCallbackWrapper = function() {
          var now = new Date().getTime();
          GF._loopFrame++;
          GF.loop = GF.scheduleFrame(GF.gameLoopCallbackWrapper);
          var dt = now - GF.lastGameLoopFrame;
          if(dt > GF.options.frameTimeLimit) { dt = GF.options.frameTimeLimit; }
          callback.apply(GF,[dt / 1000]);
          GF.lastGameLoopFrame = now;
        };

        GF.scheduleFrame(GF.gameLoopCallbackWrapper);
        return GF;
      };

      // Pause Game
      GF.pauseGame = function() {
        if(GF.loop) {
          GF.cancelFrame(GF.loop);
        }
        GF.loop = null;
      };

      // Unpause Game
      GF.unpauseGame = function() {
        if(!GF.loop) {
          GF.lastGameLoopFrame = new Date().getTime();
          GF.loop = GF.scheduleFrame(GF.gameLoopCallbackWrapper);
        }
      };

      // Toggle Pause
      GF.togglePause = function(){
        if(GF.loop){ // Unpaused
          GF.pauseGame(); // Set Pause
        }else{ // Paused
          GF.unpauseGame(); // Unpause
        }
      };

      //=======================================================================
      //  The base Class object
      //
      //  Ocugine Game Framework uses the Simple JavaScript inheritance
      //  Class object, created by John Resig.
      //
      //  The class is used wholesale, with the only differences being that
      //  instead of appearing in a top-level namespace, the `Class` object
      //  is available as `GF.Class` and a second argument on the `extend`
      //  method allows for adding class level methods and the class name is
      //  passed in a parameter for introspection purposes.
      //
      //  Classes can be created by calling `GF.Class.extend(name,{ .. })`,
      //  although most of the time you'll want to use one of the derivitive
      //  classes, `GF.EventedClass` or `GF.GameObject` which have a little
      //  bit of functionality built-in. `GF.EventedClass` adds event binding
      //  and triggering support and `GF.GameObject` adds support for
      //  components and a destroy method.
      //=======================================================================
      (function(){
        var initializing = false,
            fnTest = /xyz/.test(function(){ var xyz;}) ? /\b_super\b/ : /.*/;
        /** The base Class implementation (does nothing)
         *
         * @constructor
         * @for GF.Class
         */
        GF.Class = function(){};

        /**
         * See if a object is a specific class
         *
         * @method isA
         * @param {String} className - class to check against
         */
        GF.Class.prototype.isA = function(className) {
          return this.className === className;
        };

        /**
         * Create a new Class that inherits from this class
         *
         * @method extend
         * @param {String} className
         * @param {Object} properties - hash of properties (init will be the constructor)
         * @param {Object} [classMethods] - optional class methods to add to the class
         */
        GF.Class.extend = function(className, prop, classMethods) {
          /* No name, don't add onto GF */
          if(!GF._isString(className)) {
            classMethods = prop;
            prop = className;
            className = null;
          }
          var _super = this.prototype,
              ThisClass = this;

          /* Instantiate a base class (but only create the instance, */
          /* don't run the init constructor) */
          initializing = true;
          var prototype = new ThisClass();
          initializing = false;

          function _superFactory(name,fn) {
            return function() {
              var tmp = this._super;

              /* Add a new ._super() method that is the same method */
              /* but on the super-class */
              this._super = _super[name];

              /* The method only need to be bound temporarily, so we */
              /* remove it when we're done executing */
              var ret = fn.apply(this, arguments);
              this._super = tmp;

              return ret;
            };
          }

          /* Copy the properties over onto the new prototype */
          for (var name in prop) {
            /* Check if we're overwriting an existing function */
            prototype[name] = typeof prop[name] === "function" &&
              typeof _super[name] === "function" &&
                fnTest.test(prop[name]) ?
                  _superFactory(name,prop[name]) :
                  prop[name];
          }

          /* The dummy class constructor */
          function Class() {
            /* All construction is actually done in the init method */
            if ( !initializing && this.init ) {
              this.init.apply(this, arguments);
            }
          }

          /* Populate our constructed prototype object */
          Class.prototype = prototype;

          /* Enforce the constructor to be what we expect */
          Class.prototype.constructor = Class;
          /* And make this class extendable */
          Class.extend = GF.Class.extend;

          /* If there are class-level Methods, add them to the class */
          if(classMethods) {
            GF._extend(Class,classMethods);
          }

          if(className) {
            /* Save the class onto GF */
            GF[className] = Class;

            /* Let the class know its name */
            Class.prototype.className = className;
            Class.className = className;
          }

          return Class;
        };
      }());

      //=======================================================================
      //  Evented class
      //  The `GF.EventedClass` class adds event handling onto the base `GF.Class`
      //  class. GF.EventedClass objects can trigger events and other objects
      //  can bind to those events.
      //=======================================================================
      GF.Class.extend("EventedClass",{
        // Binds a callback to an event on this object.
        on: function(event,target,callback) {
          if(GF._isArray(event) || event.indexOf(",") !== -1) {
            event = GF._normalizeArg(event);
            for(var i=0;i<event.length;i++) {
              this.on(event[i],target,callback);
            }
            return;
          }

          if(!callback) {
            callback = target;
            target = null;
          }

          if(!callback) {
            callback = event;
          }

          if(GF._isString(callback)) {
            callback = (target || this)[callback];
          }

          this.listeners = this.listeners || {};
          this.listeners[event] = this.listeners[event] || [];
          this.listeners[event].push([ target || this, callback]);

          if(target) {
            if(!target.binds) { target.binds = []; }
            target.binds.push([this,event,callback]);
          }
        },

        // Triggers an event, passing in some optional additional data about the event.
        trigger: function(event,data) {
          if(this.listeners && this.listeners[event]) {
            for(var i=0,len = this.listeners[event].length;i<len;i++) {
              var listener = this.listeners[event][i];
              listener[1].call(listener[0],data);
            }
          }
        },

        // Unbinds an event. Can be called with 1, 2, or 3 parameters, each
        //  of which unbinds a more specific listener.
        off: function(event,target,callback) {
          if(!target) {
            if(this.listeners[event]) {
              delete this.listeners[event];
            }
          } else {
            // If the callback is a string, find a method of the
            // same name on the target.
            if(GF._isString(callback) && target[callback]) {
              callback = target[callback];
            }
            var l = this.listeners && this.listeners[event];
            if(l) {
              // Loop from the end to the beginning, which allows us
              // to remove elements without having to affect the loop.
              for(var i = l.length-1;i>=0;i--) {
                if(l[i][0] === target) {
                  if(!callback || callback === l[i][1]) {
                    this.listeners[event].splice(i,1);
                  }
                }
              }
            }
          }
        },

        // This method is called to remove any listeners an object had on other objects.
        debind: function() {
           if(this.binds) {
             for(var i=0,len=this.binds.length;i<len;i++) {
               var boundEvent = this.binds[i],
                   source = boundEvent[0],
                   event = boundEvent[1];
               source.off(event,this);
             }
           }
         }
       });

      //=======================================================================
      //  Components
      //  Components are self-contained pieces of functionality that can be
      //  added onto and removed from objects. The allow for a more dynamic
      //  functionality tree than using inheritance (i.e. by favoring
      //  composition over inheritance) and are added and removed on the fly
      //  at runtime.
      //
      //  Combining components with events makes it easy to create reusable
      //  pieces of functionality that can be decoupled from each other.
      //=======================================================================
      // The master list of registered components, indexed in an object by name.
      GF.components = {};
      GF.EventedClass.extend("Component",{
        // Components are created when they are added onto a `GF.GameObject` entity. The entity
        // is directly extended with any methods inside of an `extend` property and then the
        // component itself is added onto the entity as well.
        init: function(entity) {
          this.entity = entity;
          if(this.extend) { GF._extend(entity,this.extend);   }
          entity[this.name] = this;
          entity.activeComponents.push(this.componentName);
          if(entity.stage && entity.stage.addToList) {
            entity.stage.addToList(this.componentName,entity);
          }
          if(this.added) { this.added(); }
        },

        // `destroy` is called automatically when a component is removed from an entity
        destroy: function() {
          if(this.extend) {
            var extensions = GF._keys(this.extend);
            for(var i=0,len=extensions.length;i<len;i++) {
              delete this.entity[extensions[i]];
            }
          }
          delete this.entity[this.name];
          var idx = this.entity.activeComponents.indexOf(this.componentName);
          if(idx !== -1) {
            this.entity.activeComponents.splice(idx,1);

            if(this.entity.stage && this.entity.stage.addToList) {
              this.entity.stage.addToLists(this.componentName,this.entity);
            }
          }
          this.debind();
          if(this.destroyed) { this.destroyed(); }
        }
      });

      //=======================================================================
      //  Game Objects
      //  This is the base class most OcugineGF objects are derived from,
      //  it extends `GF.EventedClass` and adds component support to an object,
      //  allowing components to be added and removed from an object. It also
      //  defines a destroyed method which will debind the object, remove it
      //  from it's parent (usually a scene) if it has one, and trigger a
      //  destroyed event.
      //=======================================================================
      GF.EventedClass.extend("GameObject",{
        // Simple check to see if a component already exists
        // on an object by searching for a property of the same name.
        has: function(component) {
          return this[component] ? true : false;
        },

        // Adds one or more components to an object
        add: function(components) {
          components = GF._normalizeArg(components);
          if(!this.activeComponents) { this.activeComponents = []; }
          for(var i=0,len=components.length;i<len;i++) {
            var name = components[i],
                Comp = GF.components[name];
            if(!this.has(name) && Comp) {
              var c = new Comp(this);
              this.trigger('addComponent',c);
            }
          }
          return this;
        },

        // Removes one or more components from an object
        del: function(components) {
          components = GF._normalizeArg(components);
          for(var i=0,len=components.length;i<len;i++) {
            var name = components[i];
            if(name && this.has(name)) {
              this.trigger('delComponent',this[name]);
              this[name].destroy();
            }
          }
          return this;
        },

        // Destroys the object by calling debind and removing the
        // object from it's parent
        destroy: function() {
          if(this.isDestroyed) { return; }
          this.trigger('destroyed');
          this.debind();
          if(this.stage && this.stage.remove) {
            this.stage.remove(this);
          }
          this.isDestroyed = true;
          if(this.destroyed) { this.destroyed(); }
        }
      });

      //=======================================================================
      //  Registers a component with the engine, making it available to
      //  `GF.GameObject`'s. This creates a new descendent class of
      //  `GF.Component` with new methods added in.
      //=======================================================================
      GF.component = function(name,methods) {
        if(!methods) { return GF.components[name]; }
        methods.name = name;
        methods.componentName = "." + name;
        return (GF.components[name] = GF.Component.extend(name + "Component",methods));
      };

      //=======================================================================
      //  Generic Game State object that can be used to
      //  track of the current state of the Game.
      //=======================================================================
      GF.GameObject.extend("GameState",{
        // Initialize
        init: function(p) {
          this.p = GF._extend({},p);
          this.listeners = {};
        },

        // Resets the state to value p, triggers a reset event.
        reset: function(p) { this.init(p); this.trigger("reset"); },

        // Internal helper method to set an individual property
        _triggerProperty: function(value,key) {
          if(this.p[key] !== value) {
            this.p[key] = value;
            this.trigger("change." + key,value);
          }
        },

        // Set one or more properties, trigger events on those properties changing.
        set: function(properties,value) {
          if(GF._isObject(properties)) {
            GF._each(properties,this._triggerProperty,this);
          } else {
            this._triggerProperty(value,properties);
          }
          this.trigger("change");
        },

        // Increment an individual property by amount, uses set internally
        inc: function(property,amount) {
          this.set(property,this.get(property) + amount);
        },

        // Decrement an individual property by amount, uses set internally
        dec: function(property,amount) {
          this.set(property,this.get(property) - amount);
        },

        // Multiply an individual property by amount, uses set internally
        mul: function(property, amount){
          this.set(property,this.get(property) * amount);
        },

        // Save Game State to Local storage
        save_state: function(){
          /* TODO: Save Game State */
        },

        // Load Game State from Local Storage
        load_state: function(){
          /* TODO: Load Game State */
        },

        // Return an individual property
        get: function(property) {
          return this.p[property];
        }
      });

      // Top-level `GF.GameState` instance, generally used for global state in the game
      GF.state = new GF.GameState();
      // Reset the global game state
      GF.reset = function() { GF.state.reset(); };

      // Detect Mobile Devices
      GF.touchDevice = (typeof exports === 'undefined') && ('ontouchstart' in document);

      //=======================================================================
      //  Canvas Methods
      //
      //  The `setup` and `clear` method are the only two canvas-specific
      //  methods in the core of OcugineGF. `imageData`  also uses canvas
      //  but it can be used in any type of game.
      //
      //  Setup will either create a new canvas element and append it to the
      //  body of the document or use an existing one. It will then pull out
      //  the width and height of the canvas for engine use.
      //
      //  Available options:
      //  * width - width of created canvas
      //  * height - height of created canvas
      //  * maximize - set to true to maximize to screen, "touch" to
      //  maximize on touch devices
      //=======================================================================
      // Setup Method
      GF.setup = function(id, options) {
        if(GF._isObject(id)) {
          options = id;
          id = null;
        }
        options = options || {};
        id = id || "OcugineGF";
        GF.el = (GF._isString(id))?document.getElementById(id):id;

        if(!GF.el) {
          GF.el = document.createElement("canvas");
          GF.el.width = options.width || 320;
          GF.el.height = options.height || 420;
          GF.el.id = id;
          document.body.appendChild(GF.el);
        }

        var w = parseInt(GF.el.width,10), h = parseInt(GF.el.height,10);
        var maxWidth = options.maxWidth || 5000,
            maxHeight = options.maxHeight || 5000,
            resampleWidth = options.resampleWidth,
            resampleHeight = options.resampleHeight,
            upsampleWidth = options.upsampleWidth,
            upsampleHeight = options.upsampleHeight;

        if(options.maximize === true || (GF.touchDevice && options.maximize === 'touch'))  {
          document.body.style.padding = 0;
          document.body.style.margin = 0;
          w = options.width || Math.min(window.innerWidth,maxWidth) - ((options.pagescroll)?17:0);
          h = options.height || Math.min(window.innerHeight - 5,maxHeight);

          if(GF.touchDevice) {
            GF.el.style.height = (h*2) + "px";
            window.scrollTo(0,1);
            w = Math.min(window.innerWidth,maxWidth);
            h = Math.min(window.innerHeight,maxHeight);
          }
        } else if(GF.touchDevice) {
          window.scrollTo(0,1);
        }

        if((upsampleWidth && w <= upsampleWidth) || (upsampleHeight && h <= upsampleHeight)) {
          GF.el.style.height = h + "px";
          GF.el.style.width = w + "px";
          GF.el.width = w * 2;
          GF.el.height = h * 2;
        } else if(((resampleWidth && w > resampleWidth) || (resampleHeight && h > resampleHeight)) && GF.touchDevice) {
          GF.el.style.height = h + "px";
          GF.el.style.width = w + "px";
          GF.el.width = w / 2;
          GF.el.height = h / 2;
        } else {
          GF.el.style.height = h + "px";
          GF.el.style.width = w + "px";
          GF.el.width = w;
          GF.el.height = h;
        }

        var elParent = GF.el.parentNode;
        if(elParent && !GF.wrapper) {
          GF.wrapper = document.createElement("div");
          GF.wrapper.id = GF.el.id + '_container';
          GF.wrapper.style.width = w + "px";
          GF.wrapper.style.margin = "0 auto";
          GF.wrapper.style.position = "relative";
          elParent.insertBefore(GF.wrapper,GF.el);
          GF.wrapper.appendChild(GF.el);
        }

        GF.el.style.position = 'relative';
        GF.ctx = GF.el.getContext && GF.el.getContext("2d");
        GF.width = parseInt(GF.el.width,10);
        GF.height = parseInt(GF.el.height,10);
        GF.cssWidth = w;
        GF.cssHeight = h;

        if(options.scaleToFit) {
          var factor = 1;
          var winW = window.innerWidth*factor;
          var winH = window.innerHeight*factor;
          var winRatio = winW/winH;
          var gameRatio = GF.el.width/GF.el.height;
          var scaleRatio = gameRatio < winRatio ? winH/GF.el.height : winW/GF.el.width;
          var scaledW = GF.el.width * scaleRatio;
          var scaledH = GF.el.height * scaleRatio;
          GF.el.style.width = scaledW + "px";
          GF.el.style.height = scaledH + "px";
          if(GF.el.parentNode) {
            GF.el.parentNode.style.width = scaledW + "px";
            GF.el.parentNode.style.height = scaledH + "px";
          }
          GF.cssWidth = parseInt(scaledW,10);
          GF.cssHeight = parseInt(scaledH,10);
          if(gameRatio > winRatio) {
            var topPos = (winH - scaledH)/2;
            GF.el.style.top = topPos+'px';
          }
        }

        window.addEventListener('orientationchange',function() {
          setTimeout(function() { window.scrollTo(0,1); }, 0);
        });
        return GF;
      };

      // Clear the canvas completely.
      GF.clear = function() {
        if(GF.clearColor) {
          GF.ctx.globalAlpha = 1;
          GF.ctx.fillStyle = GF.clearColor;
          GF.ctx.fillRect(0,0,GF.width,GF.height);
        } else {
          GF.ctx.clearRect(0,0,GF.width,GF.height);
        }
      };

      // Set Image Smoothing
      GF.setImageSmoothing = function(enabled) {
        GF.ctx.mozImageSmoothingEnabled = enabled;
        GF.ctx.webkitImageSmoothingEnabled = enabled;
        GF.ctx.msImageSmoothingEnabled = enabled;
        GF.ctx.imageSmoothingEnabled = enabled;
      };

      // Return canvas image data given an Image object.
      GF.imageData = function(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        return ctx.getImageData(0,0,img.width,img.height);
      };

      //=======================================================================
      //  Assets Loader Methods
      //=======================================================================
      // Available assets types for loading
      GF.assetTypes = {
        png: 'Image', jpg: 'Image', gif: 'Image', jpeg: 'Image',
        ogg: 'Audio', wav: 'Audio', m4a: 'Audio', mp3: 'Audio'
      };

      // Return the file extension of a filename
      GF._fileExtension = function(filename) {
        var fileParts = filename.split("."),
            fileExt = fileParts[fileParts.length-1].toLowerCase();
        return fileExt;
      };

      // Determine the type of asset based on the `GF.assetTypes` lookup table
      GF.assetType = function(asset) {
        var fileExt = GF._fileExtension(asset);
        var fileType =  GF.assetTypes[fileExt];
        if(fileType === 'Audio' && GF.audio && GF.audio.type === "WebAudio") {
          fileType = 'WebAudio';
        }

        return fileType || 'Other';
      };

      // Either return an absolute URL, or add a base to a relative URL
      GF.assetUrl = function(base,url) {
        var timestamp = "";
        if(GF.options.development) {
          timestamp = (/\?/.test(url) ? "&" : "?") + "_t=" +new Date().getTime();
        }
        if(/^https?:\/\//.test(url) || url[0] === "/") {
          return url + timestamp;
        } else {
          return base + url + timestamp;
        }
      };

      // Load Image Asset
      GF.loadAssetImage = function(key,src,callback,errorCallback) {
        var img = new Image();
        img.onload = function() {  callback(key,img); };
        img.onerror = errorCallback;
        img.src = GF.assetUrl(GF.options.imagePath,src);
      };

      // Audio Mime Types List
      GF.audioMimeTypes = { mp3: 'audio/mpeg',
                            ogg: 'audio/ogg; codecs="vorbis"',
                            m4a: 'audio/m4a',
                            wav: 'audio/wav' };


      // Audio Assets extension
      GF._audioAssetExtension = function() {
        if(GF._audioAssetPreferredExtension) { return GF._audioAssetPreferredExtension; }
        var snd = new Audio();
        return GF._audioAssetPreferredExtension =
          GF._detect(GF.options.audioSupported,
             function(extension) {
             return snd.canPlayType(GF.audioMimeTypes[extension]) ?
                                    extension : null;
          });
      };

      // Loader for Audio assets
      GF.loadAssetAudio = function(key,src,callback,errorCallback) {
        if(!document.createElement("audio").play || !GF.options.sound) {
          callback(key,null);
          return;
        }

        var baseName = GF._removeExtension(src),
            extension = GF._audioAssetExtension(),
            filename = null,
            snd = new Audio();

        /* No supported audio = trigger ok callback anyway */
        if(!extension) {
          callback(key,null);
          return;
        }

        snd.addEventListener("error",errorCallback);

        // Don't wait for canplaythrough on mobile
        if(!GF.touchDevice) {
          snd.addEventListener('canplaythrough',function() {
            callback(key,snd);
          });
        }
        snd.src =  GF.assetUrl(GF.options.audioPath,baseName + "." + extension);
        snd.load();

        if(GF.touchDevice) {
          callback(key,snd);
        }
      };

      // Asset loader for Audio files if using the WebAudio API engine
      GF.loadAssetWebAudio = function(key,src,callback,errorCallback) {
        var request = new XMLHttpRequest(),
            baseName = GF._removeExtension(src),
            extension = GF._audioAssetExtension();

        request.open("GET", GF.assetUrl(GF.options.audioPath,baseName + "." + extension), true);
        request.responseType = "arraybuffer";

        // Our asynchronous callback
        request.onload = function() {
          var audioData = request.response;

          GF.audioContext.decodeAudioData(request.response, function(buffer) {
            callback(key,buffer);
          }, errorCallback);
        };
        request.send();
      };

      // Loader for other file types, just stores the data returned from an Ajax call.
      GF.loadAssetOther = function(key,src,callback,errorCallback) {
        var request = new XMLHttpRequest();
        var fileParts = src.split("."), fileExt = fileParts[fileParts.length-1].toLowerCase();
        if(document.location.origin === "file://" || document.location.origin === "null") {
          if(!GF.fileURLAlert) {
            GF.fileURLAlert = true;
            alert("OcugineGF Error: Loading assets is not supported from file:// urls - please run from a local web-server and try again");
          }
          return errorCallback();
        }

        request.onreadystatechange = function() {
          if(request.readyState === 4) {
            if(request.status === 200) {
              if(fileExt === 'json') {
                callback(key,JSON.parse(request.responseText));
              } else {
                callback(key,request.responseText);
              }
            } else {
              errorCallback();
            }
          }
        };
        request.open("GET", GF.assetUrl(GF.options.dataPath,src), true);
        request.send(null);
      };

      // Helper method to return a name without an extension
      GF._removeExtension = function(filename) {
        return filename.replace(/\.(\w{3,4})$/,"");
      };

      // Asset hash storing any loaded assets
      GF.assets = {};

      // Getter method to return an asset by its name.
      GF.asset = function(name) {
        return GF.assets[name];
      };

      // Load assets, and call our callback when done.
      GF.load = function(assets,callback,options) {
        var assetObj = {};
        if(!options) { options = {}; }
        var progressCallback = options.progressCallback;

        var errors = false, errorCallback = function(itm) { errors = true; (options.errorCallback  || function(itm) { throw("Error Loading: " + itm ); })(itm); };

        /* Convert to an array if it's a string */
        if(GF._isString(assets)) {
          assets = GF._normalizeArg(assets);
        }

        /* If the user passed in an array, convert it */
        /* to a hash with lookups by filename */
        if(GF._isArray(assets)) {
          GF._each(assets,function(itm) {
            if(GF._isObject(itm)) {
              GF._extend(assetObj,itm);
            } else {
              assetObj[itm] = itm;
            }
          });
        } else {
          assetObj = assets;
        }

        /* Find the # of assets we're loading */
        var assetsTotal = GF._keys(assetObj).length,
            assetsRemaining = assetsTotal;

        /* Closure'd per-asset callback gets called */
        /* each time an asset is successfully loaded */
        var loadedCallback = function(key,obj,force) {
          if(errors) { return; }
          if(!GF.assets[key]||force) {
            GF.assets[key] = obj;
            assetsRemaining--;
            if(progressCallback) {
               progressCallback(assetsTotal - assetsRemaining,assetsTotal);
            }
          }

          if(assetsRemaining === 0 && callback) {
            callback.apply(GF);
          }
        };

        /* Now actually load each asset */
        GF._each(assetObj,function(itm,key) {

          /* Determine the type of the asset */
          var assetType = GF.assetType(itm);

          /* If we already have the asset loaded, */
          /* don't load it again */
          if(GF.assets[key]) {
            loadedCallback(key,GF.assets[key],true);
          } else {
            /* Call the appropriate loader function */
            /* passing in our per-asset callback */
            /* Dropping our asset by name into GF.assets */
            GF["loadAsset" + assetType](key,itm,
                                       loadedCallback,
                                       function() { errorCallback(itm); });
          }
        });

      };

      // Array to store any assets that need to be preloaded
      GF.preloads = [];

      // Assets Preload Function
      GF.preload = function(arg,options) {
        if(GF._isFunction(arg)) {
          GF.load(GF._uniq(GF.preloads),arg,options);
          GF.preloads = [];
        } else {
          GF.preloads = GF.preloads.concat(arg);
        }
      };

      //=======================================================================
      //  Math Methods
      //  Math methods, for rotating and scaling points A list of matrices
      //  available
      //=======================================================================
      GF.matrices2d = [];
      GF.matrix2d = function() {
          return GF.matrices2d.length > 0 ? GF.matrices2d.pop().identity() : new GF.Matrix2D();
      };

      //=======================================================================
      //  A 2D matrix class, optimized for 2D points, where the last row of
      //  the matrix will always be 0,0,1.
      //
      //  Do not call `new GF.Matrix2D` - use the provided GF.matrix2D
      //  factory function for GC happiness:
      //    var matrix = GF.matrix2d();
      //
      //  Docs here:
      //  https://github.com/heygrady/transform/wiki/calculating-2d-matrices
      //=======================================================================
      GF.Matrix2D = GF.Class.extend({
        // Initialization
        init: function(source) {
          if(source) {
            this.m = [];
            this.clone(source);
          } else {
            this.m = [1,0,0,0,1,0];
          }
        },

        // Turn this matrix into the identity
        identity: function() {
          var m = this.m;
          m[0] = 1; m[1] = 0; m[2] = 0;
          m[3] = 0; m[4] = 1; m[5] = 0;
          return this;
        },

        // Clone another matrix into this one
        clone: function(matrix) {
          var d = this.m, s = matrix.m;
          d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
          d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
          return this;
        },

        // multiply two matrices (leaving the result in this)
        multiply: function(matrix) {
          var a = this.m, b = matrix.m;

          var m11 = a[0]*b[0] + a[1]*b[3];
          var m12 = a[0]*b[1] + a[1]*b[4];
          var m13 = a[0]*b[2] + a[1]*b[5] + a[2];

          var m21 = a[3]*b[0] + a[4]*b[3];
          var m22 = a[3]*b[1] + a[4]*b[4];
          var m23 = a[3]*b[2] + a[4]*b[5] + a[5];

          a[0]=m11; a[1]=m12; a[2] = m13;
          a[3]=m21; a[4]=m22; a[5] = m23;
          return this;
        },

        // Multiply this matrix by a rotation matrix rotated radians radians
        rotate: function(radians) {
          if(radians === 0) { return this; }
          var cos = Math.cos(radians),
              sin = Math.sin(radians),
              m = this.m;

          var m11 = m[0]*cos  + m[1]*sin;
          var m12 = m[0]*-sin + m[1]*cos;

          var m21 = m[3]*cos  + m[4]*sin;
          var m22 = m[3]*-sin + m[4]*cos;

          m[0] = m11; m[1] = m12; // m[2] == m[2]
          m[3] = m21; m[4] = m22; // m[5] == m[5]
          return this;
        },

        // Helper method to rotate by a set number of degrees (calls rotate internally)
        rotateDeg: function(degrees) {
          if(degrees === 0) { return this; }
          return this.rotate(Math.PI * degrees / 180);
        },

        // Multiply this matrix by a scaling matrix scaling sx and sy
        scale: function(sx,sy) {
          var m = this.m;
          if(sy === void 0) { sy = sx; }
          m[0] *= sx;
          m[1] *= sy;
          m[3] *= sx;
          m[4] *= sy;
          return this;
        },

        // Multiply this matrix by a translation matrix translate by tx and ty
        translate: function(tx,ty) {
          var m = this.m;
          m[2] += m[0]*tx + m[1]*ty;
          m[5] += m[3]*tx + m[4]*ty;
          return this;
        },

        // Transform x and y coordinates by this matrix
        transform: function(x,y) {
          return [ x * this.m[0] + y * this.m[1] + this.m[2],
                   x * this.m[3] + y * this.m[4] + this.m[5] ];
        },

        // Transform an object with an x and y property by this Matrix
        transformPt: function(obj) {
          var x = obj.x, y = obj.y;
          obj.x = x * this.m[0] + y * this.m[1] + this.m[2];
          obj.y = x * this.m[3] + y * this.m[4] + this.m[5];
          return obj;
        },

        // Transform an array with an x and y elements by this Matrix and put the result in the outArr
        transformArr: function(inArr,outArr) {
          var x = inArr[0], y = inArr[1];
          outArr[0] = x * this.m[0] + y * this.m[1] + this.m[2];
          outArr[1] = x * this.m[3] + y * this.m[4] + this.m[5];
          return outArr;
        },

        // Return just the x coordinate transformed by this Matrix
        transformX: function(x,y) {
          return x * this.m[0] + y * this.m[1] + this.m[2];
        },

        // Return just the y coordinate transformed by this Matrix
        transformY: function(x,y) {
          return x * this.m[3] + y * this.m[4] + this.m[5];
        },

        // Release this Matrix to be reused
        release: function() {
          GF.matrices2d.push(this);
          return null;
        },

         // Set the complete transform on a Canvas 2D context
         setContextTransform: function(ctx) {
          var m = this.m;
          ctx.transform(m[0],m[3],m[1],m[4],m[2],m[5]);
        }

      });

      // Return Game Framework Instance
      return GF;
    };

    //=======================================================================
    //  Lastly, add in the `requestAnimationFrame` shim, if necessary.
    //  Does nothing if `requestAnimationFrame` is already on the `window`
    //  object.
    //=======================================================================
    (function() {
        if (typeof window === 'undefined') return;
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    // Return Game Framework Instance
    return OcugineGF;
};

// Module Initialization
if(typeof exports === 'undefined') {
    ocugineCore(this,"OcugineGF");
} else {
    var OcugineGF = ocugineCore(module,"exports");
}
