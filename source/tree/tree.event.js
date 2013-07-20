/**
 * Protopack Tree events
 */
Protopack.Tree.addMethods({

    /**
     * Occurs on tree node click
     */
    click: function(e) {
        this._selectNode(e.memo.id);
        this.fire('tree:click', e.memo);
    },

    /**
     * Occurs on mouse over event
     */
    mouseOver: function(e) {
        //console.log(e);
        e.memo.element.addClassName('hover');
        this.fire('tree:mouseover', e.memo);
    },

    /**
     * Occurs on mouse out event
     */
    mouseOut: function(e) {
        e.memo.element.removeClassName('hover');
        this.fire('tree:mouseout', e.memo);
    },
});