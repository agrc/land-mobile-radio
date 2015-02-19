/* jshint maxlen:false */
define(['dojo/has', 'esri/config'], function (has, esriConfig) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    
    window.AGRC = {
        appName: 'land-mobile-radio',

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '0.1.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        // exportWebMapUrl: String
        //      print task url
        exportWebMapUrl: 'http://mapserv.utah.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        urls: {
            search: 'http://api.mapserv.utah.gov/api/v1/search/{0}/{1}',
            mapService: '/arcgis/rest/services/LandMobileRadio/MapServer'
        },

        layerIndices: {
            existing: 0,
            proposed: 1
        },

        keyWords: {
            existing: 'Existing',
            proposed: 'Proposed'
        },

        fieldNames: {
            Status: 'Status',
            Power: 'Power',
            Name: 'Name',
            Location: 'Location',
            TowerName: 'TowerName'
        },

        sliderRange: [1, 11]
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});