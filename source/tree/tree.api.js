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
        if (!this.nodeById[id]) return;
        var node = this.nodeById[id],
            ul = node.element.next('ul'),
            nodeObj;
        if (ul === undefined) {
            nodeObj = this.dataObj.getNode(id);
            ul = this.getTreeNodes(nodeObj.nodes);
            node.outer.insert(ul);
        } else {
            ul.show();
        }
        if (ul.children.length > 0) {
            node.expander.className = 'open';
        }

        if (deep) {
            if (!nodeObj) {
                nodeObj = this.dataObj.getNode(id);
            }
            nodeObj.nodes.each(function(nObj) {
                this.expand(nObj.id, true);
            }.bind(this));
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
        if (!this.nodeById[id]) return;
        var node = this.nodeById[id],
            ul = node.element.next('ul'),
            nodeObj;
        if (ul === undefined) {
            if (deep) {
                nodeObj = this.dataObj.getNode(id);
                ul = this.getTreeNodes(nodeObj.nodes);
                node.outer.insert(ul);
            } else {
                return;
            }
        }
        ul.hide();
        if (ul.children.length > 0) {
            node.expander.className = 'close';
        }

        if (deep) {
            if (!nodeObj) {
                nodeObj = this.dataObj.getNode(id);
            }
            nodeObj.nodes.each(function(nObj) {
                this.collapse(nObj.id, true);
            }.bind(this));
        }
    },

    /**
     * Expands all nodes
     */
    expandAll: function () {
        this.dataObj.getNodes().each(function(node) {
            this.expand(node.id, true);
        }, this);
    },

    /**
     * Collapses all nodes
     */
    collapseAll: function () {
        this.dataObj.getNodes().each(function(node) {
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
    }
});