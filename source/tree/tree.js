/**
 * Protopack Tree is a DHTML tree component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.2
 * @created     October 4, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree base class
 */
var ProtopackTree = Class.create({
    /**
     * Default configuration
     */
    options: {
        className: 'ptree',
        multiSelect: false,
        interactive: true,
        expanded: false     // TODO: not implemented yet
    },

    /**
     * Tree initializer
     *
     * @param   mixed   target  Target element or element ID
     * @param   object  options Input options {className, multiSelect}
     * @param   object  events  Tree events {nodeclick, nodemouseover, nodemouseout}
     *
     * @return  Object  A class instance of Tree 
     */
    initialize: function (target, options, events) {
        this.events = events || {};
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.multiSelect = this.options.multiSelect;
        this.className = this.options.className;
        this.selected = (this.multiSelect)? [] : null;
        this.dataById = {};
        this.nodeById = {};
        this.tree = this._construct(target);
        this._createEvents();
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
        var tree = new Element('div', {'class': this.className});
        if (target) {
            $(target).update(tree);
        }
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
        function parseData(parent, nodeObj) {
            var store = data.partition(function(row) {
                return row[1] == parent;
            });
            data = store[1];
            store[0].each(function(row) {
                var node = nodeObj.addNode(row[0], row[1], row[2], row[3] || null);
                if (data.length > 0) {
                    parseData(row[0], node);
                }
            });
        }
        var dataObj = new TreeDataObj(0, -1, 'root', null),
            dataById = {},
            tree;

        data.each( function (row, i) {
            dataById[row[0]] = row;
        });
        this.dataById = dataById;

        parseData(0, dataObj);
        this.dataObj = dataObj;
        tree = this.getTreeNodes(this.dataObj.nodes);
        this.tree.update(tree);
        try {
            tree.down('li').addClassName('first');
        } catch(err) {};
    },

    getTreeNodes: function (nodes) {
        var ul = new Element('ul');
        //nodes.sort( function (n1, n2) {return n1.data.seq - n2.data.seq;} );
        nodes.each( function (node, i) {
            var options = {multiSelect:this.multiSelect, interactive:this.options.interactive},
                nodeObj = new ProtopackTreeNode(node, options);
            nodeObj.div.addClassName('node');
            if (this.multiSelect) {
                nodeObj.div.down('label').observe('click', this._onLabelClick.bind(this));
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
        var nodes = this.tree.select('div');
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

    _createEvents: function () {
        this.tree.observe('node:click', this._onNodeClick.bind(this));
        this.tree.observe('node:mouseover', this._onNodeMouseOver.bind(this));
        this.tree.observe('node:mouseout', this._onNodeMouseOut.bind(this));
        this.tree.observe('node:toggle', this._onToggleNode.bind(this));
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
            var inputs = this.tree.select('input[type=checkbox][value=' + row[0] + ']');
                checked = row[3]? row[3].checked : false;
            inputs[0].checked = checked;
        }.bind(this));
    },

    /**
     * Adds click functionality to labels
     */
    _onLabelClick: function (e) {
        var input = e.element().previous();
        input.checked = !input.checked;
    },

    /**
     * Occurs on clicking a node and trigers user defined function if exists
     */
    _onNodeClick: function (e) {
        this._selectNode(e.memo.id);
        if (this.events.nodeclick) {
            this.events.nodeclick(e.memo, e);
        }
    },

    /**
     * Occurs on moving mouse over a node and trigers user defined function if exists
     */
    _onNodeMouseOver: function (e) {
        e.memo.element.addClassName('hover');
        if (this.events.nodemouseover) {
            this.events.nodemouseover(e.memo, e);
        }
    },

    /**
     * Occurs on moving mouse out of a node and trigers user defined function if exists
     */
    _onNodeMouseOut: function (e) {
        e.memo.element.removeClassName('hover');
        if (this.events.nodemouseout) {
            this.events.nodemouseout(e.memo, e);
        }
    },

    /**
     * Expands/Collapse node
     */
    _onToggleNode: function (e) {
        this.expand(e.memo.id);
        return;

        var div = e.memo.element,
            ul = div.next('ul');
        if (ul === undefined) {
            var nodeObj = this.dataObj.getNode(e.memo.id);
            ul = this.getTreeNodes(nodeObj.nodes);
            div.up('li').insert(ul);
            div.previous('span').className = 'open';
        } else {
            if (ul.visible()) {
                ul.hide();
                div.previous('span').className = 'close';
            } else {
                ul.show();
                div.previous('span').className = 'open';
            }
        }
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
        if (this.dataById[id] === undefined) return;
        if (this.multiSelect) {
            var checked = this.dataById[id].data.checked,
                i = this.selected.indexOf(id);
            if (checked) {
                this.selected.splice(i, 1);
            } else if (i === -1) {
                this.selected.push(id);
            }
            this.dataById[id].data.checked = !checked;
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
     * Returns label or array of label of the givven node IDs
     */
    getText: function (ids) {
        if (Object.isArray(ids)) {
            return ids.map(function (id) {
                return this.dataById[id].label;
            }.bind(this));
        } else {
            return this.dataById[ids].label;
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
        this.tree.id = id;
    },

    setCaption: function (caption) {
        if (this.caption) {
            this.caption.update(caption);
        } else {
            //rootNode = new ProtopackTreeNode(this.multiSelect, this.caption);
            this.caption = new Element('div', {'class': 'caption'}).update(caption);
            this.tree.insert({before: this.caption});
        }
        return this.caption;
    }

});

//=================================================================================================

/**
 * TreeDataObj base class
 */
var TreeDataObj = Class.create({

    initialize: function (id, pid, name, data) {
        this.id = id;
        this.pid = pid;
        this.name = name;
        this.data = data || null;
        this.nodes = [];
    },

    addNode: function(id, pid, name, data) {
        var parent = this.getNode(pid),
            node = new TreeDataObj(id, pid, name, data);
        parent.nodes.push(node);
        return node;
    },

    getNode: function(id) {
        if (this.id == id) {
            return this;
        }

        var res = false;
        this.nodes.each(function(node) {
            if (node.id == id) {
                res = node;
                throw $break;
            }
        });

        if (res === false) {
            this.nodes.each(function(node) {
                res = node.getNode(id);
                if (res) {
                    throw $break;
                }
            });
        }

        return res;
    },

    getNodes: function(recursive) {
        var nodes = this.nodes.clone();
        if (recursive) {
            this.nodes.each(function(node) {
                var res = node.getNodes(true);
                nodes = nodes.concat(res);
                // res.each(function(r) {
                    // nodes.push(r);
                // });
            });
        }
        return nodes;
    }
});

//=================================================================================================

/**
 * ProtopackTreeNode base class
 */
var ProtopackTreeNode = Class.create({

    /**
     * Initiates the tree node
     *
     * @node    Array [id, pid, label, data]
     *              id    : String (ID of the node element)
     *              pid   : String (ID of the parent node element)
     *              label : String (label of the node)
     *              data  : Object {id, seq, checked, title, href, target, className, style, dir, UserDefined..}
     * @options Object {interactive, multiSelect}
     *
     * @return  Object  A class instance of TreeNode
     */
    initialize: function (node, options) {
        this.id    = node.id;
        this.pid   = node.pid;
        this.label = node.name;
        this.data  = node.data || {};
        // this.style       = node[4] || {};
        // this.seq         = this.attrib.seq || 0;
        this.li    = this._construct(options);
        this.eventParams = {id:this.id, pid:this.pid, text:this.label, element:this.div};
    },

    _construct: function (options) {
        var container = new Element('li'),
            nodeItem  = new Element('div'),
            textEl;
        if (options.multiSelect) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.id});
            textEl = new Element('label').update(this.label);
            if (typeof this.data.checked != 'undefined') {
                checkbox.writeAttribute({checked: this.data.checked}); // Does not work on IE6
            } else {
                this.data.checked = false;
            }
            nodeItem.insert(checkbox);
        } else {
            textEl = new Element('a').update(this.label);
            if (typeof this.data.href != 'undefined') {
                textEl.writeAttribute({href: this.data.href});
                if (typeof this.data.target != 'undefined') {
                    textEl.writeAttribute({target: this.data.target});
                }
            }
        }
        nodeItem.insert(textEl);
        if (typeof this.data.id != 'undefined') nodeItem.writeAttribute({id: this.data.id});
        if (typeof this.data.title != 'undefined') nodeItem.writeAttribute({title: this.data.title});
        if (typeof this.data.dir != 'undefined') nodeItem.writeAttribute({dir: this.data.dir});
        if (typeof this.data.className != 'undefined') nodeItem.addClassName(this.data.className);
        if (typeof this.data.style != 'undefined') nodeItem.setStyle(this.data.style);
        nodeItem.observe('click', this._onClick.bind(this));
        nodeItem.observe('mouseover', this._onMouseOver.bind(this));
        nodeItem.observe('mouseout', this._onMouseOut.bind(this));

        if (options.interactive) {
            var expander = new Element('span');
            expander.observe('click', this._onToggleNode.bind(this)),
            container.insert(expander);
        }
        this.div = nodeItem;
        container.insert(nodeItem);

        return container;
    },

    _onClick: function (e) {
        e.element().fire('node:click', this.eventParams);
    },

    _onMouseOver: function (e) {
        e.element().fire('node:mouseover', this.eventParams);
    },

    _onMouseOut: function (e) {
        e.element().fire('node:mouseout', this.eventParams);
    },

    _onToggleNode: function (e) {
        e.element().fire('node:toggle', this.eventParams);
    }

});