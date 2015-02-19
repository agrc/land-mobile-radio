require([
    'app/Legend',

    'dojo/dom-construct',
    'dojo/text!app/tests/data/legend.json'
], function(
    WidgetUnderTest,

    domConstruct,
    legendTxt
) {
    describe('app/Legend', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Legend', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('formatLegendJson', function () {
            it('returns the correct object', function () {
                var result = widget.formatLegendJson(JSON.parse(legendTxt));

                expect(result.existing._11).toBe('iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAA' +
                    'lwSFlzAAAOxAAADsQBlSsOGwAAADFJREFUOI1jYaAyYKGZgd///v1PiUGczMyMKAZSC4waOGrgqIGjBtLZQFh5RjUDqQUAt' +
                    'PkEYS5kKrYAAAAASUVORK5CYII=');
                expect(result.proposed._11).toBe('iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAA' +
                    'lwSFlzAAAOxAAADsQBlSsOGwAAADFJREFUOI1jYaAyYKGZgf+///lPiUGMnCyMKAZSC4waOGrgqIGjBtLZQFh5RjUDqQUAt' +
                    'JgEYEBG1AAAAAAASUVORK5CYII=');
            });
        });
    });
});
