/**
 *  Protopack Tree, a DHTML Tree Component based on Prototype JS framework
 *  © 2011-2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on October 4, 2011
 *
 *  http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackTreeOptions = {
    className: 'pp-tree',
    multiSelect: false,
    interactive: true,
    defaultState: 'expand'
}

/**
 * Tree base class
 */
var ProtopackTree = Class.create({
    Version: '1.0',

    /**
     * Initiates the tree
     *
     * @target  Object/String   Target element (ID) as tree container
     * @options Object          Tree options: {className, multiSelect}
     * @events  Object          Tree events: {nodeclick, nodemouseover, nodemouseout}
     *
     * @return  Object          A class instance of Tree 
     */
    initialize: function (target, options, events) {
        this.events = events || {};
        this.options = Object.clone(ProtopackTreeOptions);
        Object.extend(this.options, options || {});
        this.multiSelect = this.options.multiSelect;
        this.className = this.options.className;
        this.selected = (this.multiSelect)? [] : null;
        this.xhtml = this._construct();
        this._createEvents();
        if (target) {
            $(target).update(this.xhtml);
        }
        // default checked inputs does not work on IE6
        //if (Prototype.Browser.IE6) {
            //this._refresh.bind(this).delay(0.1);
        //}
    },

    /**
     * XHTML constructor
     *
     * @return  String      XHTML tree
     */
    _construct: function () {
        var xhtml = new Element('div', {'class': this.className});
        this.tree = new Element('div');
        return xhtml.insert(this.tree);
    },

    /**
     * Inserts nodes in to the tree and renders that
     *
     * @data    Array           Array of nodes which each node is an array itself
     *                          node:   Array[id, pid, text, attrib, style]
     *                          attrib: Array[id, title, seq, href, target, className, dir]
     *                          style:  String
     *
     * @return  Object          A class instance of Tree 
     */
    reload: function () {
        var nodes = [],
            nodesById = {},
            dataById  = {},
            rootNodes = [],
            display = '',
            tree;

        if (this.options.interactive && this.options.defaultState === 'collapse') {
            display = 'none';
        }
        nodes = this.data.map( function (node) {
            var options = {multiSelect:this.multiSelect, interactive:this.options.interactive},
                nodeItem = new ProtopackTreeNode(node, options);
            nodeItem.node.addClassName(this.className + '-node');
            if (this.multiSelect) {
                nodeItem.node.down('label').observe('click', this._onLabelClick.bind(this));
                if (nodeItem.data.checked) {
                    this.selected.push(nodeItem.id);
                }
            }
            return nodeItem;
        }.bind(this));

        // It seems these two properties have cost and should become optional
        nodes.each( function (node, i) {
            nodesById[node.id] = node;
        });
        this.nodesById = nodesById;
        this.data.each( function (data, i) {
            dataById[data[0]] = data;
        });
        this.dataById = dataById;

        function getChildNodes(id) {
            var res = nodes.partition(function (node) {return node.pid == id;});
            nodes = res[1]; // remained nodes
            return res[0];
        }

        function buildNodes(nodesArr) {
            var ul = new Element('ul').setStyle({display:display}),
                len = nodesArr.length;
            nodesArr.each( function (node, i) {
                var chNodes = getChildNodes(node.id);
                chNodes.sort( function (n1, n2) {return n1.seq - n2.seq;} );
                if (chNodes.length > 0) {
                    node.xhtml.addClassName('has-child');
                    node.xhtml.insert(buildNodes(chNodes));
                } else {
                    node.xhtml.addClassName('no-child');
                }
                if (i == len - 1) {
                    node.xhtml.addClassName('last');
                }
                ul.insert(node.xhtml);
            });
            return ul;
        }

        rootNodes = getChildNodes(-1);
        if (rootNodes.length === 0) {
            rootNodes = getChildNodes(0);
        }
        if (rootNodes.length != 0) {
            rootNodes = rootNodes.sort(function (n1, n2) {return n1.seq - n2.seq;});
            tree = buildNodes(rootNodes);
            // if (nodes.length > 0) { // orphan remained nodes
                // nodes.each(function (node) {
                    // tree.insert(node.xhtml.addClassName('orphan'));
                // });
            // }
            this.tree.update(tree.show());
            this.render();
        }
    },

    /**
     * Loads data and build the tree
     *
     * @data    Array   Array of nodes which each node is an array itself
     */
    loadData: function (data) {
        this.data = data;
        this.reload();
    },

    render: function () {
        if (!this.options.interactive) {
            return;
        }
        var nodes = this.tree.select('div');
        nodes.each(function (node) {
            if (node.next()) {
                if (node.next().visible()) {
                    node.previous('span').className = 'minus';
                } else {
                    node.previous('span').className = 'plus';
                }
            } else {
                node.previous('span').className = 'l';
            }
        });
    },

    _createEvents: function () {
        this.xhtml.observe('node:click', this._onNodeClick.bind(this));
        this.xhtml.observe('node:mouseover', this._onNodeMouseOver.bind(this));
        this.xhtml.observe('node:mouseout', this._onNodeMouseOut.bind(this));
        this.xhtml.observe('node:toggle', this._onToggleNode.bind(this));
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
                checked = row[3]? row[3]['checked'] : false;
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
        var node = e.memo.element;
        if (node.next()) {
            if (node.next().visible()) {
                node.next().hide();
                node.previous('span').className = 'plus';
            } else {
                node.next().show();
                node.previous('span').className = 'minus';
            }
        } else {
            node.previous('span').className = 'l';
        }
    },

    /**
     * Empties the 'selected' attribute and clears highlighted/checked nodes
     */
    clearSelection: function () {
        if (this.multiSelect) {
            this.selected.each(function (id) {
                this.nodesById[id].data.checked = false;
                this.nodesById[id].node.down('input').checked = false;
            }.bind(this));
            this.selected.clear();
        } else {
            if (this.selected !== null && this.nodesById[this.selected]) {
                this.nodesById[this.selected].node.removeClassName('selected');
            }
            this.selected = null;
        }
    },

    /**
     * Occurs on node click and updates the 'selected' attribute of the tree
     */
    _selectNode: function (id) {
        if (typeof this.nodesById[id] == 'undefined') return;
        if (this.multiSelect) {
            var checked = this.nodesById[id].data.checked,
                i = this.selected.indexOf(id);
            if (checked) {
                this.selected.splice(i, 1);
            } else if (i === -1) {
                this.selected.push(id);
            }
            this.nodesById[id].data.checked = !checked;
            this.nodesById[id].node.down('input').checked = !checked;
        } else {
            this.clearSelection();
            this.nodesById[id].node.addClassName('selected');
            this.selected = id;
        }
    },

    /**
     * Updates the 'selected' attribute of the tree and selects appropriate node(s)
     */
    setSelected: function (sel) {
        if (this.multiSelect) {
            function doSelect(id) {
                this.nodesById[id].data.checked = true;
                this.nodesById[id].node.down('input').checked = true;
            };
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
                return this.nodesById[id].label;
            }.bind(this));
        } else {
            return this.nodesById[ids].label;
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
        var count = 0
        this.data.each( function (node) {
            if (node[1] == id) {
                count++
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
            //rootNode = new ProtopackTreeNode(this.multiSelect, this.caption);
            this.caption = new Element('div', {'class': this.className + '-caption'}).update(caption);
            this.tree.insert({before: this.caption});
        }
        return this.caption;
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
        this.id    = node[0];
        this.pid   = node[1];
        this.label = node[2];
        this.data  = node[3] || {};
        // this.style       = node[4] || {};
        // this.seq         = this.attrib.seq || 0;
        this.xhtml       = this._construct(options);
        this.eventParams = {id:this.id, pid:this.pid, text:this.label, element:this.node};
    },

    _construct: function (options) {
        var container = new Element('li'),
            nodeItem  = new Element('div');
        if (options.multiSelect) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.id}),
                textEl = new Element('label').update(this.label);
            if (typeof this.data.checked != 'undefined') {
                checkbox.writeAttribute({checked: this.data.checked}); // Does not work on IE6
            } else {
                this.data.checked = false;
            }
            nodeItem.insert(checkbox);
        } else {
            var textEl = new Element('a').update(this.label);
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
            var expander = new Element('span', {'class':'spacer'});
            expander.observe('click', this._onToggleNode.bind(this)),
            container.insert(expander);
        }
        this.node = nodeItem;
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