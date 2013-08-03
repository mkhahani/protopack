/**
 * Protopack TreeSelect is a DHTML tree combobox component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.2
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
        className: 'ptreeselect', // base classname
        interactive: false,       // not implemented yet
        multiSelect: false,       // use of checkboxes or not
        fullPath: true,           // display full path of selected node (single mode)
        pathSep: ' > '            // Path separator
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
        this.options.readonly = true;
        this.className = this.options.className;
        this.multiSelect = this.options.multiSelect;
        this.buttonStyle = 'disabled';
        this.dropdownStyle = 'auto';
        this.value = [];
        this.xhtml = this.construct();
        if (target) {
            $(target).insert(this.xhtml);
            this.render();
        }
        Protopack.extendEvents(this);
    },

    construct: function ($super) {
        var xhtml = $super();
            entry = new Element('input', {type:'hidden'});
            options = {
                multiSelect: this.multiSelect, 
                interactive:this.options.interactive
            },
            tree = new Protopack.Tree(null, options);
        tree.observe('tree:click', this.select.bind(this));
        this.valueEntry = entry;
        this.tree = tree;
        xhtml.insert(entry);
        return xhtml.insert(this.dropdown.setContent(tree.xhtml));
    },

    select: function (node) {
        if (this.multiSelect) {
            this.value = this.valueEntry.value = this.tree.selected;
        } else {
            this.value = this.valueEntry.value = node.data.id;
            this.dropdown.close();
        }
        this.text = this.entry.value = this.fetchText(this.tree.selected);
        this.fire('treeselect:change', this.value);
    },

    /**
     * Returns text of given node ID's
     */
    fetchText: function (idSet) {
        var res = [];
        if (Object.isArray(idSet)) {
            idSet.each(function (id) {
                var node = this.tree.getNode(id);
                if (node) {
                    res.push(node.data.text);
                }
            }, this);
            return res.join(', ');
        } else {
            var node = this.tree.getNode(idSet);
            if (node) {
                if (this.options.fullPath) {
                    var id = idSet;
                    while (id != '0') {
                        res.push(this.tree.getNode(id).data.text);
                        id = this.tree.getNode(id).data.pid;
                    }
                    return res.reverse().join(this.options.pathSep);
                } else {
                    return node.data.text;
                }
            }
        }
        return null;
    },

    loadData: function (data) {
        this.tree.loadData(data);
        this.render();
    },

    setId: function (id) {
        this.xhtml.id = id;
    },

    setName: function (name) {
        this.valueEntry.name = name;
    },

    setValue: function (value) {
        this.tree.clear();
        this.tree.select(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
        this.text = this.fetchText(value);
        this.entry.value = this.text;
    },

    /**
     * Selects all tree nodes (in multiSelect mode)
     */
    selectAll: function () {
        this.tree.selectAll();
        this.setValue(this.tree.selected);
    },

    clear: function () {
        this.tree.clear();
        this.value = this.valueEntry.value = this.tree.selected;
        this.entry.value = this.text = '';
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
