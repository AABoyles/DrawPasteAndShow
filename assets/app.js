var map, vectors, formats;

$(function(){
    $("#info").tabs();

    map = new OpenLayers.Map('map');
    var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

    vectors = new OpenLayers.Layer.Vector("Vector Layer");

    map.addLayers([wms, vectors]);
    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.EditingToolbar(vectors));
    map.addControl(new OpenLayers.Control.ModifyFeature(vectors));

    var select = new OpenLayers.Control.SelectFeature(vectors, {
        hover: true,
        onSelect: serialize
    });
    map.addControl(select);
    select.activate();

    updateFormats();

    map.setCenter(new OpenLayers.LonLat(0, 0), 3);

    $("#outputFormatType").change(function(){
      console.log($(this).val());
      if($(this).val()=="geojson"){
        $("#pp").fadeIn();
      } else {
        $("#pp").hide();
      }
      serialize();
    })
});

function serialize(feature) {
    if(feature){}else{feature = vectors.features;}
    var type = document.getElementById("outputFormatType").value;
    var pretty = document.getElementById("prettyPrint").checked;
    var str = formats['out'][type].write(feature, pretty);
    str = str.replace(/,/g, ', ');
    $('#outputtext').val(str);
}

function deserialize() {
    var type = $("#outputFormatType").val();
    var features = formats['in'][type].read($('#inputtext').val());
    var bounds;
    if(features) {
        vectors.removeAllFeatures();
        if(features.constructor != Array) {
            features = [features];
        }
        for(var i=0; i<features.length; ++i) {
            if (!bounds) {
                bounds = features[i].geometry.getBounds();
            } else {
                bounds.extend(features[i].geometry.getBounds());
            }
        }
        vectors.addFeatures(features);
        map.zoomToExtent(bounds);
    } else {
        alert('Couldn\'t parse as ' + type + '. Is that actually the right format?');
    }
}

function updateFormats(){
    var in_options = {
        'internalProjection': map.baseLayer.projection,
        'externalProjection': new OpenLayers.Projection(OpenLayers.Util.getElement("inproj").value)
    };
    var out_options = {
        'internalProjection': map.baseLayer.projection,
        'externalProjection': new OpenLayers.Projection(OpenLayers.Util.getElement("outproj").value)
    };
    var gmlOptions = {
        featureType: "feature",
        featureNS: "http://example.com/feature"
    };
    var gmlOptionsIn = OpenLayers.Util.extend(
        OpenLayers.Util.extend({}, gmlOptions),
        in_options
    );
    var gmlOptionsOut = OpenLayers.Util.extend(
        OpenLayers.Util.extend({}, gmlOptions),
        out_options
    );
    var kmlOptionsIn = OpenLayers.Util.extend(
        {extractStyles: true}, in_options);
    formats = {
      'in': {
        wkt: new OpenLayers.Format.WKT(in_options),
        geojson: new OpenLayers.Format.GeoJSON(in_options),
        georss: new OpenLayers.Format.GeoRSS(in_options),
        gml2: new OpenLayers.Format.GML.v2(gmlOptionsIn),
        gml3: new OpenLayers.Format.GML.v3(gmlOptionsIn),
        kml: new OpenLayers.Format.KML(kmlOptionsIn),
        atom: new OpenLayers.Format.Atom(in_options),
        gpx: new OpenLayers.Format.GPX(in_options),
        encoded_polyline: new OpenLayers.Format.EncodedPolyline(in_options)
      },
      'out': {
        wkt: new OpenLayers.Format.WKT(out_options),
        geojson: new OpenLayers.Format.GeoJSON(out_options),
        georss: new OpenLayers.Format.GeoRSS(out_options),
        gml2: new OpenLayers.Format.GML.v2(gmlOptionsOut),
        gml3: new OpenLayers.Format.GML.v3(gmlOptionsOut),
        kml: new OpenLayers.Format.KML(out_options),
        atom: new OpenLayers.Format.Atom(out_options),
        gpx: new OpenLayers.Format.GPX(out_options),
        encoded_polyline: new OpenLayers.Format.EncodedPolyline(out_options)
      }
    };
}
