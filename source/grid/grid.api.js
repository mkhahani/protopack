/**
 * Protopack Grid API's
 */
Protopack.Grid.addMethods({
    /**
     * Calls user defined function to initilize grid
     */
    init: function(func) {
        this.initFunc = func;
        func(this._pageIndex);
    },

    /**
     * Sets ID of the grid
     */
    setId: function(id) {
        this.grid.id = id;
    },

    /**
     * Sets number of rows for pagination
     */
    pageBy: function(count) {
        this._pageBy = count;
    },

    /**
     * Fills the specified filter listbox with givven data values
     */
    setFilterList: function(name, values) {
        if (!this.options.filtering) {
            throw new Error('ProtopackGrid.setFilterList(): filter option is disabled');
        }
        var select = this.header.down('form')[name];
        if (Object.isArray(values) && values.length > 0) {
            values.each( function(value) {
                var option = new Element('option', {value: value[0]}).update(value[1]);
                select.insert(option);
            });
        }
    },

    /**
     * Loads givven data in to grid
     */
    loadData: function (data, total) {
        this._load(data);
        this.total = (typeof total == 'undefined')? data.length : total;
        if (this._pageBy !== 0) {
            this.maxPageIndex = Math.ceil(this.total / this._pageBy);
        }
        this._updatePager();
    },

    /**
     * Does some improvments on grid view - useful when called after hide/show
     */
    render: function () {
        var widthArr = this.table.tHead.select('th').map(function (th, i) {
            return th.hasClassName('hidden')? 0 : th.measure('width');
        });
        this.header.select('th').each(function (th, i) {
            th.setAttribute('width', widthArr[i] + 'px');
            //th.setStyle({width:widthArr[i] + 'px'});
        });

        if (this.table.getHeight() > this.body.getHeight()) { // when we have scrollbars on grid
            this.header.setStyle('padding-right:16px');
        } else {
            this.header.setStyle('padding-right:0');
        }
    },

    /**
     * Reloads grid with current data
     */
    reload: function () {
        this._load(this.data);
    },

    /**
     * Assigns classnames (no data update)
     */
    refresh: function () {
        var rows = this.table.tBodies[0].select('tr');
        if (this.options.rowClasses) {
            rows.each(function (tr, i) {
                tr.addClassName('row' + i);
            });
        }
        if (this.options.oddEvenRows) {
            rows.each(function (tr, i) {
                var className = (i % 2 === 0)? 'even' : 'odd',
                    oposite = (className === 'odd')? 'even' : 'odd';
                if (tr.hasClassName(oposite)) {
                    tr.removeClassName(oposite);
                }
                if (!tr.hasClassName(className)) {
                    tr.addClassName(className);
                }
            });
        }
    },

    /**
     * Selects a row
     */
    selectRow: function(rowIndex) {
        this._selectRow(this.table.tBodies[0].rows[rowIndex - 1]);
    },

    /**
     * Selects a cell
     */
    selectCell: function(rowIndex, cellIndex) {
        this._selectCell(this.table.tBodies[0].rows[rowIndex - 1].cells[cellIndex - 1]);
    },

    /**
     * Clears all selected rows
     */
    clearSelection: function() {
        this.table.tBodies[0].select('.selected').invoke('removeClassName', 'selected');
    },

    /**
     * Sets focus on the grid
     */
    focus: function() {
        this.body.focus();
    },

    /**
     * Client-side sort function
     *
     * @param   string  sortBy      column name
     * @param   string  sortOrder   ['ASC' or 'DESC']
     */
    sort: function(sortBy, sortOrder) {
        function _sort(a, b) {
            var key = Object.isArray(a)? colIndex : sortBy,
                sign = (sortOrder.toUpperCase() === 'ASC')? 1 : -1,
                res;
            a = a[key];
            b = b[key];
            if (typeof a == 'object') {a = a.value? a.value : a.text;}
            if (typeof b == 'object') {b = b.value? b.value : b.text;}
            if (!Object.isString(a) && !Object.isNumber(a)) {
                a = a[Object.keys(a)[0]];
                b = b[Object.keys(b)[0]];
            }
            if (a === b) {
                return 0;
            }
            if (sortType === 'num') {
                res = a - b;
            } else {
                if (a == b)
                    res = 0;
                else if (a > b)
                    res = 1;
                else
                    res = -1;
            }
            return res * sign;
        }
        var colIndex = Object.keys(this._columnsByName).indexOf(sortBy),
            sortType = this._columnsByName[sortBy].sortType;
        if (typeof sortOrder === 'undefined') {
            sortOrder = this._sortOrder;
        }
        this.data.sort(_sort);
        this.setSort(sortBy, sortOrder);
        this.reload();
    },

    /**
     * Does not sort, just sets sortBy and sortOrder on grid
     *
     * @param   string  sortBy      column name
     * @param   string  sortOrder   ['ASC' or 'DESC']
     */
    setSort: function(sortBy, sortOrder) {
        var thArr = this.header.select('th');
            index = Object.keys(this._columnsByName).indexOf(sortBy);
        thArr.invoke('removeClassName', 'sorted-asc');
        thArr.invoke('removeClassName', 'sorted-desc');
        thArr[index].addClassName('sorted-' + sortOrder.toLowerCase());
        this._sortBy = sortBy;
        this._sortOrder = sortOrder;
    },

    /**
     * Client side filter function
     *
     * @param   object  params {key1:value1, key2:value2, ...}
     */
    filter: function(params) {
        var resArr = [];
        if (this._backupData === null) {
            this._backupData = this.data.clone();
        }
        this._filterParams = params;
        this.data = [];
        this._backupData.each(function(row, ri) {
            var res = true;
            Object.keys(params).each(function(param, pi) {
                var key = Object.isArray(row)? pi : param,
                    value = (typeof row[key] === 'object')? row[key].text : String(row[key]); // how about row[key].value ?
                if (value.indexOf(params[param]) === -1) {
                    res = false;
                    throw $break;
                }
            });
            if (res) resArr.push(row);
        });
        this.data = resArr;
        this.reload();
    },

    /**
     * Returns element of the specified row
     */
    getRowElement: function(index) {
        var tr;
        if (index > this.data.length + 1) {
            throw new Error('ProtopackGrid.getRowElement(): Invalid row index');
        }
        try {
            tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.getRowElement(): Invalid tr element');
        }
        return tr;
    },

    /**
     * Inserts a new row at specified position
     */
    insertRow: function(rowData, index) {
        if (typeof index == 'undefined' || index > this.data.length) {
            index = this.data.length;
        } else {
            index--;
        }
        this._insertRow(rowData, index);
        this.data.splice(index, 0, rowData);
        this.refresh();

        return index + 1;
    },

    /**
     * Removes specified row from grid
     */
    deleteRow: function(index) {
        var tr;
        if (index > this.data.length) {
            throw new Error('ProtopackGrid.deleteRow(): Invalid row index');
        }
        try {
            tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.deleteRow(): Invalid tr element');
        }
        tr.remove();
        this.data.splice(index, 1);
        this.refresh();
    },

    /**
     * Updates specified row by givven data
     */
    updateRow: function(index, rowData) {
        var tr;
        if (index > this.data.length) {
            throw new Error('ProtopackGrid.updateRow(): Invalid row index');
        }
        try {
            tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.updateRow(): Invalid tr element');
        }
        tr.remove();
        this._insertRow(rowData, index);
        this.data[index] = rowData;
        this.refresh();
    },

    /**
     * Returns element of the specified row
     */
    updateCell: function(rowIndex, colIndex, cellData) {
        var cell;
        if (rowIndex > this.data.length) {
            throw new Error('ProtopackGrid.updateCell(): Invalid row index');
        }
        try {
            cell = this.table.tBodies[0].rows[--rowIndex].cells[colIndex-1];
        } catch(err) {
            throw new Error('ProtopackGrid.updateCell(): Invalid cell element');
        }
        var el = this._createElement(this._columns[colIndex-1], cellData);
        cell.update(el);
        this.data[rowIndex][colIndex] = cellData;
    }
});