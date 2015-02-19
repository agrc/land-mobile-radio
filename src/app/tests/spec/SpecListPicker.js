require([
    'app/ListPicker',

    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/hash'
],

function (
    ListPicker,

    array,
    domConstruct,
    hash
) {
    describe('app/ListPicker', function () {
        var testWidget;
        var values;
        var testValues = ['value2', 'value3'];
        beforeEach(function () {
            AGRC.mapDataFilter = {
                showResetDialog: true
            };
            jasmine.addMatchers({
                toHaveValues: function () {
                    return {
                        compare: function(list, expectedValues) {
                            var result = {};
                            var childrenValues = array.map(list.domNode.children, function (option) {
                                return option.value;
                            });
                            result.pass = array.every(expectedValues, function (prov) {
                                return array.some(list.domNode.children, function (option) {
                                    return (option.value === prov);
                                });
                            });

                            var notText = result.pass ? ' not' : '';
                            result.message = 'Expected ' + list.dojoAttachPoint + '[' + childrenValues + ']' + 
                                notText + ' to have [' + expectedValues + ']';

                            return result;
                        }
                    };
                }
            });
            values = [
                ['description1', 'value1'],
                ['description2', 'value2'],
                ['description3', 'value3']
            ];
            testWidget = new ListPicker({
                availableListArray: values
            }, domConstruct.create('div', {}, document.body));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
            hash('');
        });

        it('toHaveValues should work correctly', function () {
            expect(testWidget.availableList).toHaveValues(['value1', 'value2', 'value3']);
            expect(testWidget.availableList).not.toHaveValues(['value4', 'value5']);
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(ListPicker));
        });
        describe('selectValues', function () {
            beforeEach(function () {
                spyOn(testWidget, 'onOK');
                testWidget.selectValues(testValues);
            });
            it('removes the values from availableList', function () {
                expect(testWidget.availableList).not.toHaveValues(testValues);
            });
            it('adds the values to the selectedList', function () {
                expect(testWidget.selectedList).toHaveValues(testValues);                
            });
            it('fires the onOK method', function () {
                expect(testWidget.onOK).toHaveBeenCalled();
            });
            it('clears any previously selected values', function () {
                var value = ['value1'];
                spyOn(testWidget, '_onUnselectAll').and.callThrough();

                testWidget.selectValues(value);

                expect(testWidget._onUnselectAll).toHaveBeenCalled();
                expect(testWidget.selectedList).toHaveValues(value);
                expect(testWidget.selectedList).not.toHaveValues(testValues);
            });
            it('doesn\'t reset showResetDialog to true if it\'s already false', function () {
                AGRC.mapDataFilter.showResetDialog = false;

                testWidget.selectValues(['blah']);

                expect(AGRC.mapDataFilter.showResetDialog).toEqual(false);
            });
        });
        describe('clear', function () {
            it('clears any selected items', function () {
                testWidget.selectValues(testValues);

                testWidget.clear();

                expect(testWidget.getSelectedItems()).toEqual([]);
            });
            it('selects the show all radio button', function () {
                testWidget.showOnlyRB.checked = true;

                testWidget.clear();

                expect(testWidget.showAllRB.checked).toBe(true);
            });
        });
    });
});