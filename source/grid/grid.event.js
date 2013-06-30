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
    },

    /**
     * Occurs on key down event
     */
    _keyDown: function(e) {
        var key = e.keyCode;

        if (this.options.rowSelect || this.options.cellSelect) {
            // up/down navigation on rows/cells
            if (key === 38 || key === 40) {
                var cell = 0,
                    rowEl;
                if (this.selectedCell) {
                    cell = this.selectedCell.cellIndex;
                    row = this.selectedCell.up('tr').sectionRowIndex + key - 39;
                } else {
                    row = this.selectedRow? this.selectedRow.sectionRowIndex + key - 39 : 0;
                }
                rowEl = this.table.tBodies[0].rows[row];
                if (rowEl) {
                    this._selectRow(rowEl);
                    this._selectCell(rowEl.cells[cell]);
                }
            }

            // left/right navigation on cells
            if (key === 37 || key === 39) {
                if (this.selectedCell) {
                    var cell = this.selectedCell.cellIndex + key - 38,
                        rowEl = this.selectedCell.up('tr'),
                        cellEl = rowEl.cells[cell];
                    if (cellEl) {
                        this._selectCell(cellEl);
                    }
                }
            }
        }

        // deselects row/cell on Esc
        if (key === 27) {
            this._selectRow(null);
            this._selectCell(null);
        }
    }

});