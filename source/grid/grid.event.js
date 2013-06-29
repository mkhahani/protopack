/**
 * Protopack Grid events
 */
Protopack.Grid.addMethods({

    /**
     * Occurs when clicking on the grid body
     */
    _click: function(e) {
        var celEl = e.findElement('td'),
            rowEl = celEl.up('tr');
        if (celEl === document || rowEl === undefined) {
            return;
        }
        if (this.options.rowSelect) {
            this._selectRow(rowEl);
        }
        if (this.options.cellSelect) {
            this._selectCell(celEl);
        }
        this.fire('grid:click', rowEl.sectionRowIndex, celEl.cellIndex, e);
        // fixme: we need getColumnByIndex() to achieve column attributes
    },

    /**
     * Occurs when double clicking on the grid body
     */
    _dblClick: function(e) {
        var celEl = e.findElement('td'),
            rowEl = celEl.up('tr');
        if (celEl === document || rowEl === undefined) {
            return;
        }
        this.fire('grid:dblclick', rowEl.sectionRowIndex, celEl.cellIndex, e);
    },

    /**
     * Occurs on mouse over event
     */
    _mouseOver: function(e) {
        var rowEl = e.findElement('tr'),
            celEl = e.findElement('td');

        if (rowEl !== document) {
            if (this.options.rowHover) {
                this._highlightRow(rowEl);
            }
            this.fire('grid:rowover', rowEl.sectionRowIndex, e);
        }

        if (celEl !== document) {
            rowEl = celEl.up('tr');
            if (this.options.cellHover) {
                this._highlightCell(celEl);
            }
            this.fire('grid:cellover', rowEl.sectionRowIndex, celEl.cellIndex, e);
        }
    },

    /**
     * Occurs on mouse out event
     */
    _mouseOut: function(e) {
        var rowEl = e.findElement('tr'),
            celEl = e.findElement('td');

        if (rowEl !== document) {
            if (this.options.rowHover) {
                this._unHighlightRow(rowEl);
            }
            this.fire('grid:rowout', rowEl.sectionRowIndex, e);
        }

        if (celEl !== document) {
            rowEl = celEl.up('tr');
            if (this.options.cellHover) {
                this._unHighlightCell(celEl);
            }
            this.fire('grid:cellout', rowEl.sectionRowIndex, celEl.cellIndex, e);
        }
    }
});