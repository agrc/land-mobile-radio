define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/array',

    'dojo/dom',
    'dojo/dom-style',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/map/BaseMapSelector',
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',

    'ijit/widgets/layout/SideBarToggler',

    'esri/dijit/Print',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/FeatureLayer',

    './config',


    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function(
    template,

    declare,
    array,

    dom,
    domStyle,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    registry,

    BaseMap,
    BaseMapSelector,
    FindAddress,
    MagicZoom,

    SideBarToggler,

    Print,
    ArcGISDynamicMapServiceLayer,
    FeatureLayer,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: agrc.widgets.map.Basemap
        map: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            this.initMap();

            this.childWidgets.push(
                new SideBarToggler({
                    sidebar: this.sideBar,
                    map: this.map,
                    centerContainer: this.centerContainer
                }, this.sidebarToggle),
                new FindAddress({
                    map: this.map,
                    apiKey: config.apiKey
                }, this.geocodeNode),
                new MagicZoom({
                    map: this.map,
                    mapServiceURL: config.urls.vector,
                    searchLayerIndex: 4,
                    searchField: 'NAME',
                    placeHolder: 'place name...',
                    maxResultsToDisplay: 10,
                    'class': 'first'
                }, this.gnisNode),
                new MagicZoom({
                    map: this.map,
                    mapServiceURL: config.urls.vector,
                    searchLayerIndex: 1,
                    searchField: 'NAME',
                    placeHolder: 'city name...',
                    maxResultsToDisplay: 10
                }, this.cityNode),
                this.printer = new Print({
                    map: this.map,
                    url: config.exportWebMapUrl,
                    templates: [{
                        label: 'Portrait (PDF)',
                        format: 'PDF',
                        layout: 'Letter ANSI A Portrait',
                        options: {
                            legendLayers: []
                        }
                    }, {
                        label: 'Landscape (PDF)',
                        format: 'PDF',
                        layout: 'Letter ANSI A Landscape',
                        options: {
                            legendLayers: []
                        }
                    }]
                }, this.printDiv)
            );

            this.inherited(arguments);
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                console.log(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.printer.on('print-complete', function() {
                domStyle.set(that.popupBlurb, 'display', 'block');
            });

            this.inherited(arguments);
        },
        initMap: function() {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR'
                })
            );

            this.modelLyr = new ArcGISDynamicMapServiceLayer(config.urls.mapService, {
                opacity: 0.85
            });
            this.map.addLoaderToLayer(this.modelLyr);

            this.existingTowersLyr = new FeatureLayer(config.urls.mapService + '/' + config.layerIndices.existing);
            this.map.addLoaderToLayer(this.existingTowersLyr);

            this.proposedTowersLyr = new FeatureLayer(config.urls.mapService + '/' + config.layerIndices.proposed, {
                visible: false
            });
            this.map.addLoaderToLayer(this.proposedTowersLyr);

            this.map.addLayers([
                this.modelLyr,
                this.existingTowersLyr,
                this.proposedTowersLyr
            ]);
            this.updateLayers();
        },
        updateLayers: function () {
            // summary:
            //      toggles layers on or off
            console.log('app/App:updateLayers', arguments);
        
            var query;
            if (this.existingChbx.checked && !this.proposedChbx.checked) {
                query = config.fieldNames.Status + ' = \'' + config.keyWords.existing + '\'';
            } else if (this.existingChbx.checked && this.proposedChbx.checked) {
                query = '1 = 1';
            } else if (!this.existingChbx.checked && this.proposedChbx.checked) {
                query = config.fieldNames.Status + ' = \'' + config.keyWords.proposed + '\'';
            } else {
                query = '1 = 2';
            }

            var defs = [];
            defs[2] = query;
            this.modelLyr.setLayerDefinitions(defs);
            this.existingTowersLyr.setVisibility(this.existingChbx.checked);
            this.proposedTowersLyr.setVisibility(this.proposedChbx.checked);

            return query;
        }
    });
});
