/**
 * Protopack Tree events
 */
Protopack.Tree.addMethods({

    /**
     * Occurs on node click
     */
    click: function(e) {
        var id = e.memo.data.id;
        if (this.multiSelect) {
            var checked = e.memo.checkbox.checked;
            if (checked) {
                this.selectNode(id);
            } else {
                this.deselectNode(id);
            }

            if (this.options.relativeNodes) {
                // update children
                var childs = e.memo.data.getChildren(true),
                    ul = e.memo.element.next('ul');
                if (ul) {
                    ul.select('input').each(function (input) {
                        input.checked = checked;
                    });
                }
                childs.each(function (child) {
                    if (checked) {
                        this.selectNode(child.id);
                    } else {
                        this.deselectNode(child.id);
                    }
                }, this);

                // update parent hierarchy
                var pid = e.memo.data.pid;
                while (pid != 0) {
                    var parent = this.nodeById[pid],
                        childsChecked = false;
                    if (!parent) {
                        break;
                    }
                    parent.data.childs.each(function(child) {
                        childsChecked = childsChecked || child.checked;
                    });
                    parent.checkbox.checked = childsChecked;
                    if (childsChecked) {
                        this.selectNode(parent.data.id);
                    } else {
                        this.deselectNode(parent.data.id);
                    }
                    pid = parent.data.pid;
                }
            }
        } else {
            this.deselectNode(this.selected);
            this.selectNode(id);
        }
        this.fire('tree:click', e.memo);
    },

    /**
     * Occurs on node mouse over
     */
    mouseOver: function(e) {
        e.memo.element.addClassName('hover');
        this.fire('tree:mouseover', e.memo);
    },

    /**
     * Occurs on node mouse out
     */
    mouseOut: function(e) {
        e.memo.element.removeClassName('hover');
        this.fire('tree:mouseout', e.memo);
    },

    /**
     * Occurs on node expand/collapse
     */
    toggle: function(e) {
        var id = e.memo.data.id;
        if (e.memo.expander.className === 'close') {
            this.expand(id);
        } else {
            this.collapse(id);
        }
        this.fire('tree:toggle', e.memo);
    },

    /**
     * Occurs on node creation
     */
    nodeCreate: function(e) {
        this.fire('tree:nodecreate', e.memo);
    }
});
