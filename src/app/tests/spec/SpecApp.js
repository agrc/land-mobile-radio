require([
    'app/App',
    'dojo/dom-construct',
    'dojo/hash'

],

function (
    App,
    domConstruct,
    hash
    ) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            var listPicker = {
                getSelectedItems: function () { return []; }
            };
            testWidget = new App({
                lpExisting: listPicker,
                lpProposed: listPicker
            }, domConstruct.create('div', {}, document.body));
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
        describe('updateHash', function () {
            afterEach(function () {
                hash();
            });
            it('sends correct properties to hash', function () {
                testWidget.existingChbx.checked = false;
                testWidget.proposedChbx.checked = true;

                $(testWidget.slider).slider('setValue', [3, 5], true);

                expect(testWidget.updateHash()).toEqual(jasmine.objectContaining({
                    existing: 0,
                    proposed: 1,
                    min: 3,
                    max: 5
                }));
            });
        });
    });
});