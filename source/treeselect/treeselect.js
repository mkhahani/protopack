/**
 * Protopack TreeSelect is a DHTML tree combobox component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.1
 * @created     October 5, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - Protopack Input
 *    - Protopack Tree
 */


/**
 * TreeSelect base class
 */
var ProtopackTreeSelect = Class.create(ProtopackInput, {
    /**
     * Default configuration
     */
    options: {
        className   : 'ptreeselect',
        editable    : true,
        multiSelect : false,
        interactive : false,
        defaultState: 'expand'
    },

    /**
     * TreeSelect initializer
     *
     * @param   mixed   target  Target element or element ID
     * @param   object  options Input options
     * @param   object  events  Tree events
     *
     * @return  Object  A class instance of TreeSelect
     */
    initialize: function (target, options, events) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.events = events || {};
        this.className = this.options.className;
        this.editable = this.options.editable;
        this.multiSelect = this.options.multiSelect;
        this.readonly = true;
        this.buttonStyle = 'disabled';
        this.dropdownStyle = 'auto';
        this.value = [];
        this.xhtml = this._construct();
        if (target) {
            $(target).insert(this.xhtml);
            //this.render();
        }
    },

    _construct: function ($super) {
        var xhtml = $super(),   // Calling constructor of the Parent Class
            entry = new Element('input', {type:'hidden'}),
            options = {multiSelect: this.multiSelect, 
                       interactive:this.options.interactive,
                       defaultState:this.options.defaultState},
            tree = new ProtopackTree(null, 
                                     options, 
                                     {nodeclick: this._onSelect.bind(this)});

        this.valueEntry = entry;
        this.tree = tree;
        xhtml.insert(entry);
        return xhtml.insert(this.dropdown.setContent(tree.xhtml));
    },

    _updateTree: function () {
        var target = this.xhtml.up();
        this.xhtml = this._construct();
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
            this.value = this.valueEntry.value = this.tree.selected;
            this.text = this.entry.value = this.tree.getText(this.tree.selected).join(', ');
        } else {
            this.value = this.valueEntry.value = node.id;
            this.text = this.entry.value = node.text;
            this.dropdown.close();
        }
        if (this.events.onSelect) {
            this.events.onSelect();
        }
    },

    loadData: function (data) {
        this.tree.loadData(data);
        this.render();
    },

    setId: function (id) {
        this.valueEntry.id = id;
        this.valueEntry.name = id;
    },

    clear: function () {
        this.tree.clearSelection();
        this.value = this.valueEntry.value = this.tree.selected;
        this.entry.value = this.text = '';
    },

    setValue: function (value) {
        this.tree.setSelected(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
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
