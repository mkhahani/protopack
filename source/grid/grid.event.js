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
        if (celEl !== document && rowEl !== undefined) {
            this.fire('grid:dblclick', rowEl.sectionRowIndex, celEl.cellIndex, e);
        }
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

        // row/cell navigation
        if (this.options.rowSelect || this.options.cellSelect) {
            // up/down navigation on rows/cells
            if (key === 40 || key === 38) {
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
                    if (this.options.rowSelect) {
                        this._selectRow(rowEl);
                    }
                    if (this.options.rowCell) {
                        this._selectCell(rowEl.cells[cell]);
                    }
                }
            }

            // left/right navigation on cells
            if (this.options.cellSelect && (key === 37 || key === 39)) {
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

        this.fire('grid:keydown', e);        
    },

    /**
     * Occurs when clicking on title of a grid column
     */
    _sort: function(e) {
        var celEl = e.findElement('th'),
            colObj;
        if (celEl === document) {
            return;
        }
        colObj = this._columns[celEl.cellIndex];
        if (!colObj.sortType) {
            return;
        }
        this._sortBy = colObj.name;
        this._sortOrder = (this._sortOrder === 'ASC')? 'DESC' : 'ASC';
        if (this.options.sorting === 'client') {
            this.sort(this._sortBy, this._sortOrder);
        } else {
            this.fire('grid:sort', this._sortBy, this._sortOrder, e);
            this.setSort(this._sortBy, this._sortOrder);
        }
    },

    /**
     * Occurs on filter form changes
     */
    _filter: function(e) {
        var query = e.findElement().up('form').serialize(true);
        if (this.options.filtering === 'client') {
            this.filter(query);
        } else {
            this.fire('grid:filter', query, e);
        }
    }

});