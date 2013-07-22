/**
 * Protopack Tree API
 */
Protopack.Tree.addMethods({

    /**
     * Returns text or array of text of the given node IDs
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
    },

    expand: function (nodeId, deep) {
        if (!this.nodeById[nodeId]) return;
        var node = this.nodeById[nodeId],
            ul = node.element.next('ul'),
            nodeObj;
        if (ul === undefined) {
            nodeObj = this.dataObj.getNode(nodeId);
            ul = this.getTreeNodes(nodeObj.nodes);
            node.element.up('li').insert(ul);
            node.expander.className = 'open';
        } else {
            if (ul.visible()) {
                ul.hide();
                node.expander.className = 'close';
            } else {
                ul.show();
                node.expander.className = 'open';
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