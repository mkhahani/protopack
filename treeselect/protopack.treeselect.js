/**
 *  Protopack TreeSelect, a DHTML Tree Select Component based on Prototype JS framework
 *  © 2011-2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on October 5, 2011
 *
 *  http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackTreeSelectOptions = {
    className   : 'pp-treeselect',
    editable    : true,
    multiSelect : false
}

/**
 * TreeSelect base class
 */
var ProtopackTreeSelect = Class.create(ProtopackInput, {
    Version: '1.0',

    /**
     * initiates ProtopackTreeSelect object
     */
    initialize: function (target, options, events) {
        this.options     = Object.clone(ProtopackTreeSelectOptions);
        Object.extend(this.options, options || {});
        this.events      = events || {};
        this.className   = this.options.className;
        this.editable    = this.options.editable;
        this.multiSelect = this.options.multiSelect;
        this.readonly    = true;
        this.buttonStyle = 'disabled';
        this.popupStyle  = 'auto';
        this.xhtml       = this.construct();
        if (target) {
            $(target).insert(this.xhtml);
            //this.render();
        }
    },

    construct: function ($super) {
        var xhtml = $super(),   // Calling constructor of the Parent Class
            tree  = new ProtopackTree(null, 
                                      {multiSelect: this.multiSelect, className: this.className + '-tree'}, 
                                      {nodeclick: this._onSelect.bind(this)});

        this.tree = tree;
        return xhtml.insert(this.popup.update(tree.xhtml));
    },

    _updateTree: function () {
        var target = this.xhtml.up();
        this.xhtml = this.construct();
        if (target) {
            $(target).update(this.xhtml);
            //this.render();
        }
        if (this.value) {
            this.setValue(this.value);
        }
    },

    _onSelect: function (node, e) {
        if (this.multiSelect) {
            this.value = this.tree.selected;
            this.text = this.entry.value = this.tree.getText(this.tree.selected).join(', ');
        } else {
            this.value = node.id;
            this.text = this.entry.value = node.text;
            this.popup.hide();
        }
        if (this.events.onSelect) {
            this.events.onSelect();
        }
    },

    loadData: function (data) {
        this.tree.loadData(data);
        this.render();
    },

    render: function ($super) {
        $super();
    },

    setId: function (id) {
        this.entry.id = id;
    },

    clear: function () {
        this.tree.clearSelection();
        this.value = (this.tree.selected);
        this.entry.value = this.text = '';
    },

    setValue: function (value) {
        this.tree.setSelected(value);
        this.value = value = this.tree.selected;
        this.text = (Object.isArray(value))? this.tree.getText(value).join(', ') :
                                             this.tree.getText(value);
        this.entry.value = this.text;
    },

    insertNode: function (node) {
        this.tree.insertNode(node);
    },

    deleteNode: function (id) {
        this.tree.deleteNode(id);
    },

    updateNode: function (id, node) {
        this.tree.updateNode(id, node);
    }

});
