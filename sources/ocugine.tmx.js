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
//  @module OcugineTMX
//=======================================================================
var ocugineTMX = function(OcugineGF) {
  "use strict";

  // Ocugine TMX Loading Module
  OcugineGF.TMX = function(GF) {
   // Add TMX file loading support to OcugineGF
   GF.assetTypes['tmx'] = 'TMX';

   // Load a TMX file as a parsed XML DOM
   GF.loadAssetTMX =  function(key,src,callback,errorCallback) {
     GF.loadAssetOther(key,src,function(key,responseText) {
       var parser = new DOMParser();
       var doc = parser.parseFromString(responseText, "application/xml");
       callback(key,doc);
     }, errorCallback);
   };

   // Extract Asset Name
   GF._tmxExtractAssetName = function(result) {
     var source = result.getAttribute("source"),
     sourceParts = source.split("/");
     return sourceParts[sourceParts.length - 1];
   };

   // Extract Sources
   GF._tmxExtractSources = function(asset) {
     var results = asset.querySelectorAll("[source]");
     return GF._map(results,GF._tmxExtractAssetName);
   };

   // Load TMX
   GF.loadTMX = function(files,callback,options) {
     if(GF._isString(files)) {
       files = GF._normalizeArg(files);
     }
     var tmxFiles = [];
     GF._each(files,function(file) {
       if(GF._fileExtension(file) === 'tmx') {
          tmxFiles.push(file);
       }
     });
     var additionalAssets = [];
     GF.load(files,function() {
       GF._each(tmxFiles,function(tmxFile) {
         var sources = GF._tmxExtractSources(GF.asset(tmxFile));
         additionalAssets = additionalAssets.concat(sources);
       });

       if(additionalAssets.length > 0) {
         GF.load(additionalAssets,callback,options);
       } else {
         callback();
       }
     });
   };

   // attr
   function attr(elem,atr) {
     var value = elem.getAttribute(atr);
     return isNaN(value) ? value : +value;
   }

   // Parse Properties
   function parseProperties(elem) {
     var propElems = elem.querySelectorAll("property"),
         props = {};

     for(var i = 0; i < propElems.length; i++) {
       var propElem = propElems[i];
       props[attr(propElem,'name')] = attr(propElem,'value');
     }
     return props;
   }

   // Load Tilesets
   GF._tmxLoadTilesets = function(tilesets, tileProperties) {
     var gidMap = [];

     function parsePoint(pt) {
       var pts = pt.split(",");
       return [ parseFloat(pts[0]), parseFloat(pts[1]) ];
     }

     for(var t = 0; t < tilesets.length;t++) {
       var tileset = tilesets[t],
           sheetName = attr(tileset,"name"),
           gid = attr(tileset,"firstgid"),
           assetName = GF._tmxExtractAssetName(tileset.querySelector("image")),
           tilesetTileProps = {},
           tilesetProps = { tileW: attr(tileset,"tilewidth"),
                            tileH: attr(tileset,"tileheight"),
                            spacingX: attr(tileset,"spacing"),
                            spacingY: attr(tileset,"spacing")
                          };

       var tiles = tileset.querySelectorAll("tile");
       for(var i = 0;i < tiles.length;i++) {
         var tile = tiles[i];
         var tileId = attr(tile,"id");
         var tileGid = gid + tileId;

         var properties = parseProperties(tile);

         if(properties.points) {
           properties.points = GF._map(properties.points.split(" "),parsePoint);
         }

         // save the properties indexed by GID for creating objects
         tileProperties[tileGid] = properties;

         // save the properties indexed by tile number for the frame properties
         tilesetTileProps[tileId] = properties;
       }
       tilesetProps.frameProperties = tilesetTileProps;
       gidMap.push([ gid, sheetName ]);
       GF.sheet(sheetName, assetName,  tilesetProps);

     }
     return gidMap;
   };

   // Procces Image Layer
   GF._tmxProcessImageLayer = function(stage,gidMap,tileProperties,layer) {
     var assetName = GF._tmxExtractAssetName(layer.querySelector("image"));
     var properties = parseProperties(layer);
     properties.asset = assetName;

     stage.insert(new GF.Repeater(properties));
   };

   // get the first entry in the gid map that gives
   // a gid offset
   GF._lookupGid = function(gid,gidMap) {
     var idx = 0;

     while(gidMap[idx+1] && gid >= gidMap[idx+1][0]) {
       idx++;
     }
     return gidMap[idx];
   };

   // Process Tile Layer
   GF._tmxProcessTileLayer = function(stage,gidMap,tileProperties,layer) {
     var tiles = layer.querySelectorAll("tile"),
         width = attr(layer,'width'),
         height = attr(layer,'height');


     var gidDetails,gidOffset, sheetName;

     var data = [], idx=0;
     for(var y=0;y<height;y++) {
       data[y] = [];
       for(var x=0;x<width;x++) {
         var gid = attr(tiles[idx],"gid");
         if(gid === 0) {
           data[y].push(null);
         } else {
           // If we don't know what tileset this map is associated with
           // figure it out by looking up the gid of the tile w/
           // and match to the tilesef
           if(!gidOffset) {
             gidDetails = GF._lookupGid(attr(tiles[idx],"gid"),gidMap);
             gidOffset = gidDetails[0];
             sheetName = gidDetails[1];
           }
           data[y].push(gid - gidOffset);
         }
         idx++;
       }
     }

     var tileLayerProperties = GF._extend({
       tileW: GF.sheet(sheetName).tileW,
       tileH: GF.sheet(sheetName).tileH,
       sheet: sheetName,
       tiles: data
       },parseProperties(layer));

     var TileLayerClass = tileLayerProperties.Class || 'TileLayer';

     if(tileLayerProperties['collision']) {
       stage.collisionLayer(new GF[TileLayerClass](tileLayerProperties));
     } else {
       stage.insert(new GF[TileLayerClass](tileLayerProperties));
     }
   };

   // Process Object Layer
   GF._tmxProcessObjectLayer = function(stage,gidMap,tileProperties,layer) {
     var objects = layer.querySelectorAll("object");
     for(var i=0;i < objects.length;i++) {
       var obj = objects[i],
           gid = attr(obj,"gid"),
           x = attr(obj,'x'),
           y = attr(obj,'y'),
           properties = tileProperties[gid],
           overrideProperties = parseProperties(obj);

       if(!properties) { throw "Invalid TMX Object: missing properties for GID:" + gid; }
       if(!properties['Class']) { throw "Invalid TMX Object: missing Class for GID:" + gid; }

       var className = properties['Class'];
       if(!className) { throw "Invalid TMX Object Class: " + className + " GID:" + gid; }

       var p = GF._extend(GF._extend({ x: x, y: y }, properties), overrideProperties);

       // Offset the sprite
       var sprite = new GF[className](p);
       sprite.p.x += sprite.p.w/2;
       sprite.p.y -= sprite.p.h/2;

       stage.insert(sprite);
     }

   };

   // TMX Processor
   GF._tmxProcessors = { 'objectgroup': GF._tmxProcessObjectLayer,
                        'layer': GF._tmxProcessTileLayer,
                        'imagelayer': GF._tmxProcessImageLayer };

   // Stage TMX
   GF.stageTMX = function(dataAsset,stage) {
      var data = GF._isString(dataAsset) ?  GF.asset(dataAsset) : dataAsset;

      var tileProperties = {};

      // Load Tilesets
      var tilesets = data.getElementsByTagName("tileset");
      var gidMap = GF._tmxLoadTilesets(tilesets,tileProperties);

      // Go through each of the layers
      GF._each(data.documentElement.childNodes,function(layer) {
        var layerType = layer.tagName;
        if(GF._tmxProcessors[layerType]) {
          GF._tmxProcessors[layerType](stage, gidMap, tileProperties, layer);
        }
      });
    };
  };
};

// Initialize Module
if(typeof OcugineGF === 'undefined') {
  module.exports = ocugineTMX;
} else {
  ocugineTMX(OcugineGF);
}
