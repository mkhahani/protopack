/**
 * Protopack Tree API
 */
Protopack.Tree.addMethods({

    /**
     * Fetches node object
     *
     * @access  public
     * @param   mixed   Node ID (int/string)
     * @return  object  Node object
     */
    getNode: function (id) {
        return this.nodeById[id];
    },

    setId: function (id) {
        this.xhtml.id = id;
    },

    setClassName: function (className) {
        this.xhtml.className = className;
    },

    /**
     * Adds/Updates tree caption
     *
     * @access  public
     * @param   string  XHTML caption
     * @return  object  Caption element
     */
    setCaption: function (caption) {
        if (this.caption) {
            this.caption.update(caption);
        } else {
            this.caption = new Element('div', {'class': 'caption'}).update(caption);
            this.xhtml.insert({top: this.caption});
        }
        return this.caption;
    },

    /**
     * Expands node
     *
     * @access  public
     * @param   string  id      Node ID to be expanded
     * @param   bool    deep    Whether goes through it's children or not
     * @return  void
     */
    expand: function (id, deep) {
        if (!this.nodeById[id]) {
            return;
        }

        var node = this.nodeById[id],
            childEl = this.getChilds(node).show();

        if (node.data.childs.length > 0) {
            node.expander.className = 'open';
        }

        if (deep) {
            node.data.childs.each(function(child) {
                this.expand(child.id, true);
            }, this);
        }
    },

    /**
     * Collapses node
     *
     * @access  public
     * @param   string  id      Node ID to be collapsed
     * @param   bool    deep    Whether goes through it's children or not
     * @return  void
     */
    collapse: function (id, deep) {
        if (!this.nodeById[id]) {
            return;
        }

        var node = this.nodeById[id],
            childEl = this.getChilds(node).hide();

        if (node.data.childs.length > 0) {
            node.expander.className = 'close';
        }

        if (deep) {
            node.data.childs.each(function(child) {
                this.collapse(child.id, true);
            }, this);
        }
    },

    /**
     * Expands all nodes
     */
    expandAll: function () {
        this.dataObj.childs.each(function(node) {
            this.expand(node.id, true);
        }, this);
    },

    /**
     * Collapses all nodes
     */
    collapseAll: function () {
        this.dataObj.childs.each(function(node) {
            this.collapse(node.id, true);
        }, this);
    },

    /**
     * Selects given node ID(s)
     */
    select: function (idSet) {
        if (this.multiSelect) {
            idSet = Object.isArray(idSet)? idSet.uniq() : [idSet];
            idSet.each(function (id) {
                this.selectNode(id);
            }, this);
        } else {
            this.selectNode(idSet);
        }
    },

    /**
     * Selects all tree nodes (in multiSelect mode)
     */
    selectAll: function () {
        if (this.multiSelect) {
            this.select(Object.keys(this.nodeById));
        }
    },

    /**
     * Clears selected/checked nodes
     */
    clear: function () {
        if (this.multiSelect) {
            var sel = this.selected.clone();
            for (var i = 0; i < sel.length; i++) {
                this.deselectNode(sel[i]);
            }
            this.selected.clear();
        } else {
            this.deselectNode(this.selected);
        }
    },

    /**
     * Appends a new node as the last child of it's parent
     *
     * @access  public
     * @param   string  id      Node ID
     * @param   string  pid     Node parent ID
     * @param   string  text    Node text
     * @param   object  extra   Extra data (optional)
     * @return  object  Created node
     */
    insertNode: function (id, pid, text, extra) {
        var node,
            nodeObj,
            dataObj,
            container;
        if (pid == 0) {
            dataObj = this.dataObj;
            container = this.xhtml.down('ul');
        } else {
            var parent = this.nodeById[pid];
            if (!parent) {
                return;
            }
            dataObj = parent.data;
            container = this.getChilds(parent);
            parent.expander.className = 'open';
        }
        node = dataObj.addNode(id, pid, text, extra);
        nodeObj = this.createNode(node);
        container.insert(nodeObj.outer);
        nodeObj.outer.addClassName('last');
        this.nodeById[id] = nodeObj;
        try {
            nodeObj.outer.previous('li').removeClassName('last');
        } catch(err) {}

        return nodeObj;
    },

    /**
     * Removes node from tree
     *
     * @access  public
     * @param   string  id      Node ID
     * @return  object  bool    True on success and false otherwise
     */
    deleteNode: function (id) {
        var nodeObj = this.nodeById[id],
            dataObj,
            index,
            pid;
        if (!nodeObj) {
            return false;
        }
        pid = nodeObj.data.pid;
        try {
            if (pid == 0) {
                dataObj = this.dataObj;
            } else {
                var parent = this.nodeById[pid];
                if (!parent) {
                    return;
                }
                dataObj = parent.data;
                var container = nodeObj.outer.up('ul');
                if (container.children.length === 1) {
                    parent.expander.className = '';
                } else {
                    if (!nodeObj.outer.next('li')) {
                        var prev = nodeObj.outer.previous('li');
                        if (prev) {
                            prev.className = 'last';
                        }
                    }
                }
            }
            nodeObj.outer.remove();
            index = dataObj.childs.indexOf(nodeObj.data);
            dataObj.childs.splice(index, 1);
            delete this.nodeById[id];
        } catch(err) {return false;}

        return true;
    },

    updateNode: function (id, node) {
    }
});