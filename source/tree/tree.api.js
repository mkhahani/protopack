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
     * Updates the 'selected' attribute of the tree and selects appropriate node(s)
     */
    setSelected: function (sel) {
        function doSelect(id) {
            this.nodeById[id].data.checked = true;
            this.nodeById[id].element.down('input').checked = true;
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
    }
});