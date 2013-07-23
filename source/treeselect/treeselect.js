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
Protopack.TreeSelect = Class.create(Protopack.Input, {

    /**
     * Default configuration
     */
    options: {
        className : 'ptreeselect',
        multiSelect : false,
        interactive : false,
    },

    /**
     * TreeSelect initializer
     *
     * @param   mixed   target  Container element/ID
     * @param   object  options TreeSelect options
     *
     * @return  Object  Class instance of TreeSelect
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
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
        Protopack.extendEvents(this);
    },

    _construct: function ($super) {
        var xhtml = $super(),
            entry = new Element('input', {type:'hidden'}),
            options = {
                multiSelect: this.multiSelect, 
                interactive:this.options.interactive
            },
            tree = new Protopack.Tree(null, options);
        tree.observe('tree:click', this._onSelect.bind(this));
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

    _onSelect: function (node) {
        if (this.multiSelect) {
            this.value = this.valueEntry.value = this.tree.selected;
            this.text = this.entry.value = this.fetchText(this.tree.selected);
        } else {
            this.value = this.valueEntry.value = node.data.id;
            this.text = this.entry.value = node.data.text;
            this.dropdown.close();
        }
        this.fire('treeselect:change', this.value);
    },

    /**
     * Returns text of given node ID's
     */
    fetchText: function (idSet) {
        if (Object.isArray(idSet)) {
            var res = [];
            idSet.each(function (id) {
                var node = this.tree.getNode(id);
                if (node) {
                    res.push(node.data.text);
                }
            }, this);
            return res.join(', ');
        } else {
            var node = this.tree.getNode(idSet)
            if (node) {
                return node.data.text;
            }
        }
        return null;
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
        this.tree.clear();
        this.value = this.valueEntry.value = this.tree.selected;
        this.entry.value = this.text = '';
    },

    setValue: function (value) {
        this.tree.select(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
        this.text = this.fetchText(value);
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
