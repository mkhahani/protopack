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
            ul = this.getChildNodes(nodeObj.childs);
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
            nodeObj.childs.each(function(nObj) {
                this.expand(nObj.data.id, true);
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
                ul = this.getChildNodes(nodeObj.childs);
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
            nodeObj.childs.each(function(nObj) {
                this.collapse(nObj.data.id, true);
            }.bind(this));
        }
    },

    /**
     * Expands all nodes
     */
    expandAll: function () {
        this.dataObj.getNodes().each(function(node) {
            this.expand(node.data.id, true);
        }, this);
    },

    /**
     * Collapses all nodes
     */
    collapseAll: function () {
        this.dataObj.getNodes().each(function(node) {
            this.collapse(node.data.id, true);
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

    insertNode: function (id, pid, text, data) {
        var node = this.dataObj.addNode(id, pid, text, data),
            nodeObj = this.createNode(node);
    },

    deleteNode: function (id) {
    },

    updateNode: function (id, node) {
    }
});