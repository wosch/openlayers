/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/* Written by Wolfram Schneider, Dec 2012,
 * Map Compare BBBike.org: http://mc.bbbike.org/mc
 *
 * based on XYZ.js and Bing.js example code
 */

/**
 * @requires OpenLayers/Layer/XYZ.js
 */

/** 
 * Class: OpenLayers.Layer.Nokia
 * Nokia layer using direct tile access as provided by Nokia Maps REST Services.
 * See http://developer.here.net/ for more
 * information. Note: Terms of Service compliant use requires the map to be
 * configured with an <OpenLayers.Control.Attribution> control and the
 * attribution placed on or near the map.
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */

/**
 * Example: map = new OpenLayers.Layer.Nokia({type: "map", name: "Nokia Map", app_id: "SqE1xcSngCd3m4a1zEGb"})
 */
OpenLayers.Layer.Nokia = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    // for reference: all supported layers
    layers: ["normal.day", "terrain.day", "satellite.day", "hybrid.day", "normal.day.transit", "normal.day.grey"],
    
    /**
     * APIProperty: name
     * {String} The layer name. Defaults to "OpenStreetMap" if the first
     * argument to the constructor is null or undefined.
     */
    name: "Nokia",
    
    /**
     * Property: key
     * {String} API key for Nokia maps, get your own key 
     *     at http://developer.here.net/
     */
    app_id: null,
    token: null,

    /**
     * Property: attributionTemplate
     * {String}
     */
    attributionTemplate: '<span class="olNokiaAttribution">' +
         '<div><a target="_blank" href="http://maps.nokia.com/">Nokia.com</a>' +
         '</span>',
         
    
    /**
     * APIProperty: type
     * {String} The layer identifier.  
     *     used.  Default is "normal.day".
     *
     */
    type: "map",
    
    /** APIProperty: tileOptions
     *  {Object} optional configuration options for <OpenLayers.Tile> instances
     *  created by this Layer. Default is
     *
     *  (code)
     *  {crossOriginKeyword: 'anonymous'}
     *  (end)
     */
    tileOptions: {
            crossOriginKeyword: null
    },

    /**
     * Property: sphericalMercator
     * {Boolean}
     */
    sphericalMercator: true,
    
    /**
     * Constructor: OpenLayers.Layer.Nokia
     *
     * Parameters:
     * name - {String} The layer name.
     * url - {String} The tileset URL scheme.
     * options - {Object} Configuration options for the layer. Any inherited
     *     layer option can be set in this object (e.g.
     *     <OpenLayers.Layer.Grid.buffer>).
     */
    initialize: function(name, options) {
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, arguments);
        
        var type = (options.type || this.type);
        if (!checkLayerType(this.layers, type)) {
            throw "Unsupported Nokia map type: " + type;
        }
        
        var name = options.name || this.name;
        var url_list = nokiaTileSeverUrl(type, { app_id: options.app_id, token: options.token});
        
        var newArgs = [name, url_list, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
        
        this.tileOptions = OpenLayers.Util.extend({
            crossOriginKeyword: 'anonymous'
        }, this.options && this.options.tileOptions);
    },


    /**
     * APIMethod: clone
     * 
     * Parameters:
     * obj - {Object}
     * 
     * Returns:
     * {<OpenLayers.Layer.Nokia>} An exact clone of this <OpenLayers.Layer.Nokia>
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.Nokia(this.options);
        }
        //get all additions from superclasses
        obj = OpenLayers.Layer.OSM.prototype.clone.apply(this, [obj]);
        // copy/set any non-init, non-simple values here
        return obj;
    },
    
    CLASS_NAME: "OpenLayers.Layer.Nokia"
});

// [http://4.maps.nlp.nokia.com/maptile/2.1/maptile/a2e328a0c5/normal.day/${z}/${x}/${y}/256/png8?app_id=abx&token=def&lg=ENG"]
function nokiaTileSeverUrl(type, opt) {
    var app_id = opt.app_id;
    var token = opt.token;
    var servers = opt.servers;
    
    var url_prefix = "maps.nlp.nokia.com/maptile/2.1/maptile/a2e328a0c5";

    // "normal.day.grey" use a different API
    if (!servers || servers.length == 0) {
        servers = (type == "normal.day.grey" ? ["a", "b", "c", "d"] : ["1", "2", "3", "4"]);
    }
    if (type == "normal.day.grey") { // traffic
        url_prefix = "mrsmon.lbs.ovi.com/maptiler/v2/traffictile/b8abea5c78";
    }

    var url_list = [];
    for (var i = 0; i < servers.length; i++) {
        url_list.push("http://" + servers[i] + "." + url_prefix + "/" + type + "/${z}/${x}/${y}/256/png8?app_id=" + app_id + "&token=" + token + "&lg=ENG");
    }

    return url_list;
}

function checkLayerType(layers, type) {
   for (var i = 0; i < layers.length; i++) {
        if (layers[i] == type)
            return true;
   }
   return false;
}