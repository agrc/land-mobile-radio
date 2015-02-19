define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',

    'dojo/text!app/templates/ListPicker.html',

    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/query',
    'dojo/topic',

    'dijit/form/MultiSelect',
    'dijit/form/Button',


    'bootstrap'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    template,

    lang,
    array,
    domConstruct,
    domClass,
    query
    // topic
    ) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * Summary:
         * Widget used to create a subset from a large list of options.
         * Similar to the layer picker in the Legend wizard in ArcMap
         * 
         * Got some code for extending dijit.Dialog from here:
         * http://heather.koyuk.net/refractions/?p=246
         */
        
        widgetsInTemplate: true,
        templateString: template,
        className: 'list-picker',
        

        // options passed into the constructor

        // name: String
        name: null,

        // Array that the available list values will be populated with
        //      [<label>, <value>]
        availableListArray: null,

        // selectedItems: []
        //      [<label>, <value>]
        selectedItems: null,
        

        constructor: function () {
            // summary:
            //      description
            console.log('app/ListPicker:constructor', arguments);
        
            this.availableListArray = [];
            this.selectedItems = [];
        },
        postCreate: function(){
            this.inherited(arguments);
            
            // sort values and populate multiselect from array
            this.availableListArray.sort();
            array.forEach(this.availableListArray, function(item){
                var option = domConstruct.create('option');
                option.innerHTML = item[0].replace('&', '&amp;'); // replace & for IE
                option.value = item[1];
                this.availableList.domNode.appendChild(option);
            }, this);

            this.availableList.addSelected = this.addSelectedOverride;
            this.selectedList.addSelected = this.addSelectedOverride;
        },
        show: function () {
            // summary:
            //      shows the dialog
            console.log('app/ListPicker:show', arguments);
        
            $(this.modal).modal('show');
        },
        hide: function () {
            // summary:
            //      shows the dialog
            console.log('app/ListPicker:hide', arguments);
        
            $(this.modal).modal('hide');
        },
        onSelect: function(){
            // get selected options from available and add to selected
            this.selectedList.addSelected(this.availableList);
            
            // enable OK button
            this.btnOK.disabled  = false;
        },
        _onSelectAll: function(){
            // move all options from available to selected
            query('> option', this.availableList.domNode).forEach(function(option){
                option.selected = true;
            });
            this.onSelect();
        },
        onUnselect: function(){
            // get selected options from selected and move to available
            this.availableList.addSelected(this.selectedList);
            
            // disable OK button if there are no values left in selected
            var v = this.selectedList.domNode.childNodes;
            if (v.length <= 0){
                this.btnOK.disabled = true;
            }
        },
        _onUnselectAll: function(){
            console.log(this.declaredClass + '::_onUnselectAll', arguments);
            // move all options from selected to available
            query('> option', this.selectedList.domNode).forEach(function(option){
                option.selected = true;
            });
            this.onUnselect();
        },
        onOK: function(){
            // build array of selected items
            this.selectedItems = [];
            var that = this;
            domConstruct.empty(this.list);
            query('> option', this.selectedList.domNode).forEach(function(option){
                that.selectedItems.push([option.text, option.value]);
                domConstruct.create('li', {
                    innerHTML: option.text
                }, that.list);
            });

            if (this.list.children.length > 0) {
                this.showOnlyRB.checked = true;
                this.onShowOnly();
            } else {
                this.showAllRB.checked = true;
                this.onShowAll();
            }
            
            this.hide();
            
            // topic.publish(AGRC.topics.listpicker_onOK, selectedItems);
        },
        onShowOnly: function () {
            // summary:
            //      description
            console.log('app/ListPicker:onShowOnly', arguments);
        
            domClass.remove(this.list, 'disabled');

            if (this.selectedItems.length === 0) {
                this.selectedItems.push(['-1', '-1']);
            }
        },
        onShowAll: function () {
            // summary:
            //      description
            console.log('app/ListPicker:onShowAll', arguments);
        
            domClass.add(this.list, 'disabled');
        },
        addSelectedOverride: function(select){
            // this function has been altered to insert the new item(s) alphabetically
            select.getSelected().forEach(function(n){
                // the node that the new item is going to be inserted before
                var refNode;
                
                // sort through existing options until you find the refNode
                query('> option', this.domNode).some(function(option){
                    if (n.text > option.text) {
                        return false;
                    }
                    else {
                        refNode = option;
                        return true;
                    }
                }, this);
                
                if (refNode) {
                    domConstruct.place(n, refNode, 'before');
                } else {
                    // just slap it in there if there are no children
                    this.containerNode.appendChild(n);
                }
                
                // scroll to bottom to see item
                // cannot use scrollIntoView since <option> tags don't support all attributes
                // does not work on IE due to a bug where <select> always shows scrollTop = 0
                this.domNode.scrollTop = this.domNode.offsetHeight; // overshoot will be ignored
                // scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
                var oldscroll = select.domNode.scrollTop;
                select.domNode.scrollTop = 0;
                select.domNode.scrollTop = oldscroll;
            },this);
        },
        selectValues: function (values) {
            // summary:
            //      manually selects the values. Called by app/Router
            // values: String[]
            console.log(this.declaredClass + '::selectValues', arguments);

            var that = this;

            // clear any previously selected values
            this._onUnselectAll();
            query('option', this.domNode).forEach(function (node) {
                node.selected = false;
            });
        
            array.forEach(values, function (value) {
                array.some(that.availableList.domNode.children, function (option) {
                    if (option.value === value) {
                        option.selected = true;
                        return true;
                    } else {
                        return false;
                    }
                });
            });

            this.onSelect();
            this.onOK();
        },
        getSelectedItems: function () {
            // summary:
            //      description
            console.log('app/ListPicker:getSelectedItems', arguments);
        
            return (domClass.contains(this.list, 'disabled')) ? [] :
                array.map(this.selectedItems, function (item) {
                    return item[1];
                });
        },
        clear: function () {
            // summary:
            //      clears any selected items and selects the show all radio button
            console.log('app/ListPicker:clear', arguments);
        
            this._onUnselectAll();
            this.onOK();
            this.showAllRB.checked = true;
        }
    });
});