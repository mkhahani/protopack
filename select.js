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
        this.listBox = null;
        this.selectItemHandler = this._selectItem.bind(this);
        this.xhtml = this._construct($(target));
        this.render();
    },

    _construct: function ($super, target) {
        var xhtml = $super(target);   // Calling constructor of the parent class
        this.listBox = this._buildListBox(target);
        this.dropdown.setContent(this.listBox);
        return xhtml;
    },

    _buildListBox: function (target) {
        var listBox = (target.tagName.toUpperCase() === 'SELECT')?
            target : new Element('select', {size: 0});
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
        this.listBox.size = this.listBox.options.length;
    },

    setList: function (list) {
        if (Object.isArray(list)) {
            list.each(function (row) {
                this.listBox.options[this.listBox.options.length] = new Option(row[1], row[0]);
            }.bind(this));
            this.listBox.size = (list.length < this.options.listSize)?
                list.length : this.options.listSize;
        } else {
            this.listBox = $(list);
            this.dropdown.setContent(this.listBox);
        }
        this.render();
    }

});
