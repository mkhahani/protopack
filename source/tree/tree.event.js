/**
 * Protopack Tree events
 */
Protopack.Tree.addMethods({

    /**
     * Occurs on node click
     */
    click: function(e) {
        this._selectNode(e.memo.id);
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
        this.expand(e.memo.id);
        this.fire('tree:toggle', e.memo);
    },

    /**
     * Occurs on node creation
     */
    nodeCreate: function(e) {
        this.fire('tree:nodecreate', e.memo);
    }
});