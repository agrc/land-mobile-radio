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

                expect(testWidget.updateLayers()).toBe('Status = \'Existing\'');

                testWidget.existingChbx.checked = true;
                testWidget.proposedChbx.checked = true;

                expect(testWidget.updateLayers()).toBe('1 = 1');
                
                testWidget.existingChbx.checked = false;
                testWidget.proposedChbx.checked = true;

                expect(testWidget.updateLayers()).toBe('Status = \'Proposed\'');
                
                testWidget.existingChbx.checked = false;
                testWidget.proposedChbx.checked = false;

                expect(testWidget.updateLayers()).toBe('1 = 2');
            });
        });
    });
});