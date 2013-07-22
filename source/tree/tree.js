/**
 * Protopack Tree is a DHTML tree component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.3
 * @created     October 4, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree base class
 */
Protopack.Tree = Class.create({

    /**
     * Default configuration
     */
    options: {
        className: 'ptree',
        interactive: true,
        multiSelect: false,
        expanded: false     // TODO: not implemented yet
    },

    /**
     * Tree initializer
     *
     * @param   mixed   target  Container element/ID
     * @param   object  options Tree options
     *
     * @return  Object  A class instance of Tree 
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.multiSelect = this.options.multiSelect;
        this.selected = (this.multiSelect)? [] : null;
        this.dataById = {};
        this.nodeById = {};
        this.xhtml = this._construct(target);
        Protopack.extendEvents(this);
        // default checked inputs does not work on IE6
        //if (Prototype.Browser.IE6) {
            //this._refresh.bind(this).delay(0.1);
        //}
    },

    /**
     * Builds tree structure
     *
     * @param   string  target  ID of the target element
     * @return  string  XHTML grid
     */
    _construct: function (target) {
        var tree = new Element('div', {'class': this.options.className});
        if (target) {
            $(target).update(tree);
        }

        // Events
        tree.observe('node:click', this.click.bind(this));
        tree.observe('node:mouseover', this.mouseOver.bind(this));
        tree.observe('node:mouseout', this.mouseOut.bind(this));
        tree.observe('node:toggle', this.toggle.bind(this));
        tree.observe('node:create', this.nodeCreate.bind(this));

        return tree;
    },

    /**
     * Loads data and builds the tree
     *
     * @param   data    Array   Array of nodes which each node is an array itself
     *                          node: [id:int, pid:int, text:string, data:Obj]
     *
     * @return  void
     */
    loadData: function (data) {
        var parseData = function (parent, nodeObj) {
                var store = data.partition(function(row) {
                        return row[1] == parent;
                    }),
                    i;
                data = store[1];
                for (i = 0; i < store[0].length; i++) {
                    var row = store[0][i],
                        node = nodeObj.addNode(row[0], row[1], row[2], row[3] || null);
                    if (data.length > 0) {
                        parseData(row[0], node);
                    }
                }
               },
            tree,
            i;

        for (i = 0; i < data.length; i++) {
            this.dataById[data[i][0]] = data[i];
        }

        this.dataObj = new Protopack.Tree.Data(0, -1, 'root', null),
        parseData(0, this.dataObj);
        tree = this.getTreeNodes(this.dataObj.nodes);
        this.xhtml.update(tree);

        try {
            tree.down('li').addClassName('first');
        } catch (err) {}
    },

    getTreeNodes: function (nodes) {
        var ul = new Element('ul');
        //nodes.sort( function (n1, n2) {return n1.data.seq - n2.data.seq;} );
        nodes.each( function (node, i) {
            var options = {multiSelect:this.multiSelect, interactive:this.options.interactive},
                nodeObj = new Protopack.Tree.Node(node, options);
            nodeObj.div.addClassName('node');
            if (this.multiSelect) {
                if (nodeObj.data.checked) {
                    this.selected.push(nodeObj.id);
                }
            }
            if (node.nodes.length !== 0) {
                nodeObj.li.down('span').addClassName('close');
            }
            if (i === nodes.length - 1) {
                nodeObj.li.addClassName('last');
            }
            ul.insert(nodeObj.li);
            this.nodeById[node.id] = nodeObj;
        }.bind(this));

        return ul;
    },

    expand: function (nodeId, deep) {
        if (!this.nodeById[nodeId]) return;
        var node = this.nodeById[nodeId],
            ul = node.div.next('ul'),
            nodeObj;
        if (ul === undefined) {
            nodeObj = this.dataObj.getNode(nodeId);
            ul = this.getTreeNodes(nodeObj.nodes);
            node.div.up('li').insert(ul);
            node.div.previous('span').className = 'open';
        } else {
            if (ul.visible()) {
                ul.hide();
                node.div.previous('span').className = 'close';
            } else {
                ul.show();
                node.div.previous('span').className = 'open';
            }
        }

        if (deep) {
            if (!nodeObj) {
                nodeObj = this.dataObj.getNode(nodeId);
            }
            nodeObj.nodes.each(function(nObj) {
                this.expand(nObj.id, true);
            }.bind(this));
        }
    },

    render: function () {   // TODO: how about partial rendering
        if (!this.options.interactive) {
            return;
        }
        var nodes = this.xhtml.select('div');
        nodes.each(function (node) {
            if (node.next()) {
                if (node.next().visible()) {
                    node.previous('span').className = 'open';
                } else {
                    node.previous('span').className = 'close';
                }
            } else {
                node.previous('span').className = 'l';
            }
        });
    },

    _sort: function (node1, node2) {
        var n1 = node1[2].toLowerCase(),
            n2 = node2[2].toLowerCase(),
            res = 0;

        if (n1 > n2) {
            res = 1;
        } else if (n1 < n2) {
            res = -1;
        }

        return res;
    },

    _refresh: function () {
        this.data.each( function (row, index) {
            var inputs = this.xhtml.select('input[type=checkbox][value=' + row[0] + ']');
                checked = row[3]? row[3].checked : false;
            inputs[0].checked = checked;
        }.bind(this));
    },

    /**
     * Empties the 'selected' attribute and clears highlighted/checked nodes
     */
    clearSelection: function () {
        if (this.multiSelect) {
            this.selected.each(function (id) {
                this.dataById[id].data.checked = false;
                this.nodeById[id].div.down('input').checked = false;
            }.bind(this));
            this.selected.clear();
        } else {
            if (this.selected !== null && this.dataById[this.selected]) {
                this.nodeById[this.selected].div.removeClassName('selected');
            }
            this.selected = null;
        }
    },

    /**
     * Occurs on node click and updates the 'selected' attribute of the tree
     */
    _selectNode: function (id) {
        if (this.nodeById[id] === undefined) return;
        if (this.multiSelect) {
            var checked = this.nodeById[id].data.checked,
                i = this.selected.indexOf(id);
            if (checked) {
                this.selected.splice(i, 1);
            } else if (i === -1) {
                this.selected.push(id);
            }
            this.nodeById[id].data.checked = !checked;
            this.nodeById[id].div.down('input').checked = !checked;
        } else {
            this.clearSelection();
            this.nodeById[id].div.addClassName('selected');
            this.selected = id;
        }
    },

    /**
     * Updates the 'selected' attribute of the tree and selects appropriate node(s)
     */
    setSelected: function (sel) {
        function doSelect(id) {
            this.dataById[id].data.checked = true;
            this.dataById[id].node.down('input').checked = true;
        }
        if (this.multiSelect) {
            this.clearSelection();
            if (Object.isArray(sel)) {
                sel = sel.uniq();
                sel.each(doSelect, this);
                this.selected = sel;
            } else {
                this.selected = [sel];
                doSelect.call(this, sel);
            }
        } else {
            this._selectNode(sel);
        }
    },

    /**
     * Returns text or array of text of the givven node IDs
     */
    getText: function (ids) {
        if (Object.isArray(ids)) {
            return ids.map(function (id) {
                return this.dataById[id].text;
            }.bind(this));
        } else {
            return this.dataById[ids].text;
        }
    },

    _getNodeIndex: function (id) {
        var res = -1;
        this.data.each( function (row, i) {
            if (row[0] == id) {
                res = i;
                throw $break;
            }
        });
        return res;
    },

    insertNode: function (node) {
        this.data.push(node);
        this.reload();
    },

    deleteNode: function (id) {
        var index = this._getNodeIndex(id);
        if (index != -1) {
            this.data.splice(index, 1);
            this.reload();
        }
    },

    updateNode: function (id, node) {
        var index = this._getNodeIndex(id);
        if (index != -1) {
            this.data.splice(index, 1);
        }
        this.insertNode(node);
    },

    hasChild: function (id) {
        var res = false;
        this.data.each( function (node) {
            if (node[1] == id) {
                res = true;
                throw $break;
            }
        });
        return res;
    },

    numberOfChildren: function (id) {
        var count = 0;
        this.data.each( function (node) {
            if (node[1] == id) {
                count++;
            }
        });
        return count;
    },

    setId: function (id) {
        this.xhtml.id = id;
    },

    setCaption: function (caption) {
        if (this.caption) {
            this.caption.update(caption);
        } else {
            this.caption = new Element('div', {'class': 'caption'}).update(caption);
            this.xhtml.insert({before: this.caption});
        }
        return this.caption;
    },

    setClassName: function (className) {
        this.xhtml.className = className;
    }
});
