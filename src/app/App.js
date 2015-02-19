define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMap',
    'agrc/widgets/map/BaseMapSelector',

    'app/config',
    'app/Legend',
    'app/ListPicker',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/hash',
    'dojo/io-query',
    'dojo/promise/all',
    'dojo/text!app/templates/App.html',

    'esri/dijit/Print',
    'esri/InfoTemplate',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/tasks/query',

    'ijit/widgets/authentication/LoginRegister',
    'ijit/widgets/layout/SideBarToggler',

    'bootstrap-slider',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'xstyle/css!app/resources/App.css'
], function(
    FindAddress,
    MagicZoom,
    BaseMap,
    BaseMapSelector,

    config,
    Legend,
    ListPicker,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,
    registry,

    array,
    declare,
    lang,
    dom,
    domStyle,
    hash,
    ioQuery,
    all,
    template,

    Print,
    InfoTemplate,
    ArcGISDynamicMapServiceLayer,
    FeatureLayer,
    GraphicsLayer,
    Query,

    LoginRegister,
    SideBarToggler
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

        // lpExisting: ListPicker
        lpExisting: null,

        // lpProposed: ListPicker
        lpProposed: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        updatePowerText: function (values) {
            // summary:
            //      updates the power range text
            // values: number[]
            console.log('app/App:updatePowerText', arguments);
        
            this.powerSpan.innerHTML = values[0] + '-' + values[1];
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            var that = this;
            $(this.slider).slider({
                min: config.sliderRange[0],
                max: config.sliderRange[1],
                value: config.sliderRange,
                tooltip: 'hide'
            })
                .on('slideStop', lang.hitch(this, 'updateLayers'))
                .on('slide', function (evt) {
                    that.updatePowerText(evt.value);
                });

            this.initMap();

            // create hidden layer to hide magic zoom graphics for tower search
            var hiddenGraphicsLayer = new GraphicsLayer({visible: false});

            this.childWidgets.push(
                new Legend(null, this.legendDiv),
                new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    securedServicesBaseUrl: config.urls.mapService
                }),
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
                    mapServiceURL: config.urls.mapService,
                    searchLayerIndex: 3,
                    searchField: 'NAME',
                    placeHolder: 'tower ID or location name...',
                    maxResultsToDisplay: 10,
                    graphicsLayer: hiddenGraphicsLayer,
                    zoomLevel: 8
                }, this.findTowerDiv),
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

            var createListPicker = function (name, div, fSet) {
                var lp = new ListPicker({
                    name: name,
                    availableListArray: that.getList(fSet)
                }, div);
                lp.startup();
                lp.on('OK', lang.hitch(that, 'updateLayers'));
                lp.on('showOnly', lang.hitch(that, 'updateLayers'));
                lp.on('showAll', lang.hitch(that, 'updateLayers'));
                that.own(lp);
                that['lp' + name] = lp;
            };

            var query = new Query();
            query.where = '1 = 1';
            all([this.existingTowersLyr.queryFeatures(query,
                    lang.partial(createListPicker, 'Existing', that.existingFilterDiv)),
                this.proposedTowersLyr.queryFeatures(query,
                    lang.partial(createListPicker, 'Proposed', that.proposedFilterDiv))])
                .then(function () {
                    var handle = that.existingTowersLyr.on('update-end', function () {
                        handle.remove();
                        that.updateControls(ioQuery.queryToObject(hash()));
                        that.updateLayers();
                    });
                });

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
                showAttribution: false,
                router: true,
                showLabels: true
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR',
                    defaultThemeLabel: 'Lite'
                })
            );

            this.modelLyr = new ArcGISDynamicMapServiceLayer(config.urls.mapService, {
                opacity: 0.85
            });
            this.map.addLoaderToLayer(this.modelLyr);
            var infoTemplate = new InfoTemplate('${' + config.fieldNames.Location + '}',
                '${*}');

            this.existingTowersLyr = new FeatureLayer(config.urls.mapService + '/' + config.layerIndices.existing, {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: ['*'],
                showLabels: true,
                infoTemplate: infoTemplate
            });
            this.map.addLoaderToLayer(this.existingTowersLyr);

            this.proposedTowersLyr = new FeatureLayer(config.urls.mapService + '/' + config.layerIndices.proposed, {
                visible: false,
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: ['*'],
                showLabels: true,
                infoTemplate: infoTemplate
            });
            this.map.addLoaderToLayer(this.proposedTowersLyr);

            this.map.addLayers([
                this.modelLyr,
                this.existingTowersLyr,
                this.proposedTowersLyr
            ]);
        },
        updateControls: function (obj) {
            // summary:
            //      updates the filter controls based upon the props
            // obj: Object
            console.log('app/App:updateControls', arguments);

            if (obj.existing) {
                this.existingChbx.checked = obj.existing === '1';
            }
            if (obj.proposed) {
                this.proposedChbx.checked = obj.proposed === '1';
            }
            if (obj.min && obj.max) {
                $(this.slider).slider('setValue',
                    [parseInt(obj.min, 10), parseInt(obj.max, 10)
                ]);
            }
            if (obj.existingNames) {
                this.lpExisting.selectValues(obj.existingNames);
            }
            if (obj.proposedNames) {
                this.lpProposed.selectValues(obj.proposedNames);
            }

            this.updatePowerText([obj.min, obj.max]);
        },
        updateLayers: function () {
            // summary:
            //      toggles layers on or off
            console.log('app/App:updateLayers', arguments);

            // existing/proposed
            var addToggleFilter = function (cbx, fieldName, keyword) {
                if (cbx.checked) {
                    return fieldName + ' = \'' + keyword + '\'';
                } else {
                    return '1 = 2';
                }
            };
            var addTowerFilter = function (fieldName, selectedItems) {
                if (selectedItems.length > 0) {
                    return fieldName + ' IN (\'' + selectedItems.join('\',\'') + '\')';
                } else {
                    return '1 = 1';
                }
            };

            var query = '(( ' + addToggleFilter(this.existingChbx, config.fieldNames.Status, config.keyWords.existing) +
                ' AND ' + addTowerFilter(config.fieldNames.TowerName, this.lpExisting.getSelectedItems()) +
                ') OR (' + addToggleFilter(this.proposedChbx, config.fieldNames.Status, config.keyWords.proposed) +
                ' AND ' + addTowerFilter(config.fieldNames.TowerName, this.lpProposed.getSelectedItems()) +
                '))';

            // power
            var powers = $(this.slider).slider('getValue');
            query = query + ' AND ' + config.fieldNames.Power + ' >= ' + powers[0] +
                ' AND ' + config.fieldNames.Power + ' <= ' + powers[1];

            var defs = [];
            defs[2] = query;
            this.modelLyr.setLayerDefinitions(defs);

            // toggle tower layers
            this.existingTowersLyr.setDefinitionExpression(
                addTowerFilter(config.fieldNames.Name, this.lpExisting.getSelectedItems()));
            this.existingTowersLyr.setVisibility(this.existingChbx.checked);
            this.proposedTowersLyr.setDefinitionExpression(
                addTowerFilter(config.fieldNames.Name, this.lpProposed.getSelectedItems()));
            this.proposedTowersLyr.setVisibility(this.proposedChbx.checked);

            this.updateHash();

            return query;
        },
        updateHash: function () {
            // summary:
            //      updates the hash with the filter properties
            console.log('app/App:updateHash', arguments);

            var vals = $(this.slider).slider('getValue');
            var obj = lang.mixin(ioQuery.queryToObject(hash()), {
                existing: (this.existingChbx.checked) ? 1 : 0,
                proposed: (this.proposedChbx.checked) ? 1 : 0,
                min: vals[0],
                max: vals[1],
                existingNames: this.lpExisting.getSelectedItems(),
                proposedNames: this.lpProposed.getSelectedItems()
            });

            hash(ioQuery.objectToQuery(obj));

            return obj;
        },
        getList: function (fSet) {
            // summary:
            //      description
            console.log('app/App:getList', arguments);

            return array.map(fSet.features, function (g) {
                var name = g.attributes[config.fieldNames.Name];
                var loc = g.attributes[config.fieldNames.Location];
                return [loc, name];
            });
        },
        clearFilters: function () {
            // summary:
            //      resets the slider and list pickers
            console.log('app/App:clearFilters', arguments);
        
            this.lpProposed.clear();
            this.lpExisting.clear();
            $(this.slider).slider('setValue', config.sliderRange);
        }
    });
});
