require([
    'app/App',
    'dojo/dom-construct',
    'dojo/_base/window'

],

function (
    App,
    domConstruct,
    win
    ) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
        describe('updateLayers', function () {
            it('builds the correct def query', function () {
                testWidget.existingChbx.checked = true;
                testWidget.proposedChbx.checked = false;

                expect(testWidget.updateLayers()).toMatch(/Status = \'Existing\'.*$/);

                testWidget.existingChbx.checked = true;
                testWidget.proposedChbx.checked = true;

                expect(testWidget.updateLayers()).toMatch(/1 = 1.*$/);
                
                testWidget.existingChbx.checked = false;
                testWidget.proposedChbx.checked = true;

                expect(testWidget.updateLayers()).toMatch(/Status = \'Proposed\'.*$/);
                
                testWidget.existingChbx.checked = false;
                testWidget.proposedChbx.checked = false;

                expect(testWidget.updateLayers()).toMatch(/1 = 2.*$/);
            });
            it('handles slider values', function () {
                $(testWidget.slider).slider('setValue', [3, 5], true);

                expect(testWidget.updateLayers())
                    .toMatch(/^.*Power >= 3 AND Power <= 5/);

                $(testWidget.slider).slider('setValue', [1, 11], true);

                expect(testWidget.updateLayers())
                    .toMatch(/^.*Power >= 1 AND Power <= 11/);
            });
        });
    });
});