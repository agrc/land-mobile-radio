define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/string',
    'dojo/text!app/templates/Legend.html',
    'dojo/text!app/templates/LegendPopup.html',

    'esri/request',

    'xstyle/css!app/resources/Legend.css'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    dojoString,
    template,
    popupTemplate,

    request
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Builds a legend as a tooltip of the signal strengths

        templateString: template,
        baseClass: 'legend',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.Legend::postCreate', arguments);

            var that = this;
            request({
                content: {f: 'json'},
                url: config.urls.mapService + '/legend'
            }).then(function (legendJson) {
                if (legendJson.layers) {
                    var html = dojoString.substitute(popupTemplate, that.formatLegendJson(legendJson));
                    that.initTooltip(html);
                } else {
                    throw '';
                }
            }, function () {
                that.initTooltip('There was an error getting the legend info!');
            });
        },
        initTooltip: function (content) {
            // summary:
            //      description
            // content: String
            //      URL code for tooltip
            console.log('app/Legend:initTooltip', arguments);
        
            $(this.iconSpan).tooltip({
                delay: 200,
                html: true,
                placement: 'right',
                title: content,
                container: 'body'
            });
        },
        formatLegendJson: function (json) {
            // summary:
            //      returns an object suitable for the legend popup template
            // json: Object
            console.log('app/Legend:formatLegendJson', arguments);
        
            var obj = {
                existing: {},
                proposed: {}
            };

            json.layers.forEach(function (lyr) {
                if (lyr.layerId === config.layerIndices.combined) {
                    lyr.legend.forEach(function (item) {
                        var values = item.values[0].split(',');
                        obj[values[0].toLowerCase()]['_' + values[1]] = item.imageData;
                    });
                }
            });

            console.log(obj);
            return obj;
        }
    });
});