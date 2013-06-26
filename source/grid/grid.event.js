/**
 * Protopack Grid events
 */
Protopack.Grid.addMethods({

    /**
     * Selects a grid row
     */
    _bodyClick: function(e) {
        var rowEl = e.findElement('tr'),
            celEl = e.findElement('td');

        if (rowEl !== document) {
            if (this.options.rowSelect) {
                this._selectRow(rowEl);
            }
            this.fire('grid:rowselect', rowEl.rowIndex, e);
        }

        if (celEl !== document) {
            rowEl = celEl.up('tr');
            if (this.options.cellSelect) {
                this._selectCell(celEl);
            }
            this.fire('grid:cellselect', rowEl.rowIndex, celEl.cellIndex, e);
            // fixme: we need getColumnByIndex() to achieve column attributes
        }
    }
});