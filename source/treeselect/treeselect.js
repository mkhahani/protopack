/**
 * Protopack TreeSelect is a DHTML tree combobox component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.4
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
        includeRoot: false,       // the tree has a root node
        multiSelect: false,       // use of checkboxes or not
        relativeNodes: true,      // selecting a node affects relative nodes (multiSelect mode)
        fullPath: true,           // display full path of selected node (single mode)
        pathSep: ' > ',           // Path separator
        defaultText: ''           // Default text when value is null
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
        this.setText(this.options.defaultText);
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
                interactive: this.options.interactive,
                includeRoot: this.options.includeRoot,
                multiSelect: this.multiSelect,
                relativeNodes: this.options.relativeNodes
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
        this.setText(this.fetchText(this.value));
        this.fire('treeselect:change', this.value);
    },

    /**
     * Returns text of given node ID's
     */
    fetchText: function (idSet) {
        var res = [];
        if (idSet.length === 0) {
            return this.options.defaultText;
        }
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
                    while (node) {
                        res.push(node.data.text);
                        node = this.tree.getNode(node.data.pid);
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

    setText: function (text) {
        this.text = text;
        this.entry.value = text;
        this.entry.title = text;
    },

    setValue: function (value) {
        this.tree.clear();
        this.tree.select(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
        this.setText(this.fetchText(this.value));
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
        this.setText(this.options.defaultText);
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
