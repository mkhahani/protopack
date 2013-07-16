/**
 *  Protopack Select is a flexible DHTML Select Component based on Prototype JS framework
 *  Copyright 2011-2013 Mohsen Khahani
 *  Licensed under the MIT license
 *  Created on June 3, 2013
 *
 *  Dependencies:
 *    - Prototype JS framework v1.7+
 *    - input.js
 *
 *  Features:
 *    - replacement for standard select
 *    - full CSS customizable
 *
 *  http://mohsenkhahani.ir/protopack
 */


/**
 * Default configuration
 */
var ProtopackSelectOptions = {
    className : 'pselect',
    readonly : false,
    listSize: 8
};

/**
 * ProtopackSelect class
 */
var ProtopackSelect = Class.create(ProtopackInput, {
    Version: '1.0',

    initialize: function (target, options) {
        this.options = Object.clone(ProtopackSelectOptions);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.readonly = this.options.readonly;
        this.buttonStyle = 'disabled';
        this.dropdownStyle = 'auto';
        this.selectItemHandler = this._selectItem.bind(this);
        if (target) {
            this.target = $(target);
            this.xhtml = this._construct();
        }
        //console.log(this.xhtml);
        //this.render();
    },

    _construct: function ($super) {
        var xhtml = $super();   // Calling constructor of the parent class
        this.listBox = this._buildListBox();
        this.dropdown.setContent(this.listBox);
        this.render();
        return xhtml;
    },

    _buildListBox: function () {
        var listBox = new Element('select', {size:0});
        if (listBox.selectedIndex !== -1) {
            this.entry.value = listBox.options[listBox.selectedIndex].text;
        }
        listBox.observe('click', this.selectItemHandler);
        return listBox;
    },

    _selectItem: function (e) {
        if (this.listBox.selectedIndex !== -1) {
            this.entry.value = this.listBox.options[this.listBox.selectedIndex].text;
        }
        this.dropdown.close();
    },

    render: function ($super) {
        $super();
        this.listBox.size = (this.listBox.options.length < this.options.listSize)?
            this.listBox.options.length : this.options.listSize;
    },

    setData: function (data) {
        if (Object.isArray(data)) {
            data.each(function (row) {
                this.listBox.options[this.listBox.options.length] = new Option(row[1], row[0]);
            }.bind(this));
        } else {
            this.listBox = $(data);
            this.dropdown.setContent(this.listBox);
        }
        this.render();
    }

});
