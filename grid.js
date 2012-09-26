/**
 * Protopack Grid, a DHTML Grid Component based on Prototype JS framework
 * � 2011-2012 Mohsen Khahani
 *
 * Licensed under the MIT license
 * Created on July 10, 2011
 *
 * http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackGridOptions = {
    className     : 'pgrid',
    header        : true,
    footer        : true,
    sorting       : 'client',   // ['client', 'server', false]
    filtering     : false,      // ['client', 'server', false]
    pagination    : false,      // depends on footer
    rowClasses    : false,
    rowSelect     : true,
    cellClasses   : false,
    cellSelect    : true,
    oddEvenRows   : true,
    mouseRollOver : true,
    titleAlign    : 'left',
    currencySymbol: '$ '
}


/**
 * Grid base class
 */
var ProtopackGrid = Class.create({
    Version: '1.2',

    /**
     * The grid intializer
     *
     * @param   string  target  ID of the target element
     * @param   array   layout  grid layout (optional)
     * @param   object  options grid options (optional)
     * @param   object  events  grid events (optional)
     */
    initialize: function (target, layout, options, events) {
        var columnsByName = {};
        this.options = ProtopackGridOptions;
        Object.extend(this.options, options || {});
        this.events = events || {};
        this._columns = layout || [];
        this._columns.each(function (col) {
            columnsByName[col['name']] = col;
        });
        this._columnsByName = columnsByName;
        this._className = this.options.className;
        this._pageIndex = 1;
        this._pageBy = 0;
        this._backupData = null;
        this.grid = this._construct(target);
    },

    /**
     * Builds the grid structure
     *
     * @param   string  target  ID of the target element
     * @return  string  XHTML grid
     */
    _construct: function (target) {
        var grid  = new Element('div', {'class':this._className}),
            tbody = new Element('tbody'),
            table = new Element('table').update(tbody),
            body  = new Element('div', {'class':this._className + '-body'}).update(table);

        /*Event.observe(div, 'scroll', function() {
                alert('boo');
        });*/
        
        // Grid Header
        if (this.options.header) {
            this.header = this._createHeader();
            grid.insert(this.header);
        }

        // Grid Body
        this.body = body;
        this.table = table;
        this._createColumns();
        grid.insert(this.body);

        // Grid Footer
        if (this.options.footer) {
            this.footer = this._createFooter();
            grid.insert(this.footer);
        }

        if (this.events.onKeyDown) {
            body.tabIndex = '1';
            Event.observe(body, 'keydown', function(e) {
                this.events.onKeyDown(e);
            }.bind(this));
        }

        $(target).insert(grid);
        return grid;
    },

    /**
     * Adds header to grid
     */
    _createHeader: function () {
        var header   = new Element('div', {'class':this._className + '-header'}),
            table    = new Element('table'),
            trTitle  = table.insertRow(-1),
            trFilter = table.insertRow(-1),
            ignore   = 0,
            sortType = this.options.sorting;

        // Titles
        this._columns.each( function (column, index) {
            if (ignore > 0) {
                ignore--;
                return;
            }
            var th = new Element('th');
            th.setAttribute('align', this.options.titleAlign);
            if (column.hidden) {
                th.addClassName('hidden');
                th.setAttribute('width', 0);
            } else {
                if (column.image) {
                    th.insert(new Element('img', {src:column.image}));
                }
                if (column.width) {
                    th.setAttribute('width', column.width);
                }
                if (sortType && column.sortType) {
                    //var sortFunc = (sortType === 'client')? this.sort : this.events.onSort;
                    th.observe('click', function () {
                        this._sortBy = column.name;
                        this._sortOrder = (this._sortOrder === 'ASC')? 'DESC' : 'ASC';
                        //sortFunc.bind(this, this._sortBy, this._sortOrder)();
                        if (sortType === 'client') {
                            this.sort(this._sortBy, this._sortOrder);
                        } else {
                            this.events.onSort(this._sortBy, this._sortOrder);
                            this.setSort(this._sortBy, this._sortOrder);
                        }
                    }.bind(this));
                    th.addClassName('sortable');
                }
            }
            trTitle.className = 'titles';
            Element.insert(trTitle, th.insert(column.title));
            if (column.hasOwnProperty('colSpan')) {
                th.setAttribute('colspan', column.colSpan);
                ignore = column.colSpan - 1;
            }
        }.bind(this));

        // Filter
        if (this.options.filtering) {
            var form = new Element('form'),
                filterFunc = (this.options.filtering === 'client')? this.filter:
                                                                    this.events.onFilter;
            header.insert(form.insert(table));
            ignore = 0;
            trFilter.className = 'filters';
            this._columns.each( function (column, index) {
                if (ignore > 0) {
                    ignore--;
                    return;
                }
                var td = new Element('td');
                if (column.hidden) {
                    td.addClassName('hidden');
                    td.setAttribute('width', 0);
                } else {
                    if (column.filter) {
                        switch (column.filter) {
                            case 'text':
                                var input = new Element('input', {name:column.name});
                                if (column.width) {
                                    input.style.width = column.width + 'px';
                                }
                                input.observe('keydown', function(e) {
                                    if (e.keyCode == 13) {
                                        filterFunc.bind(this)(form.serialize(true));
                                    }
                                }.bind(this));
                                td.insert(input);
                                break;
                            case 'list':
                                var select = new Element('select', {name:column.name});
                                select.style.width = column.width + 'px';
                                select.observe('change', function() {
                                    filterFunc.bind(this)(form.serialize(true));
                                }.bind(this));
                                td.insert(select);
                                break;
                        }
                    }
                }
                Element.insert(trFilter, td);
                if (column.hasOwnProperty('colSpan')) {
                    td.setAttribute('colspan', column.colSpan);
                    ignore = column.colSpan - 1;
                }
            }.bind(this));
        } else {
            header.insert(table);
        }

        return header;
    },

    /**
     * Adds thead element to the table
     */
    _createFooter: function () {
        var status = new Element('span', {'class':'status'}),
            about  = new Element('span', {'class':'about'}).update('?'),
            footer = new Element('div', {'class':this._className + '-footer'}).insert(status);
        footer.insert(about.observe('click', function() {alert('Protopack JS Grid v1.0 \nby Mohsen Khahani \nhttp://mohsen.khahani.com');}));
            
        if (this.options.pagination) {
            var ctrls = new Element('div', {'class':'controls'}),
                input = new Element('input', {type:'text', size:2, value:'1'}),
                next  = new Element('input', {type:'button', 'class':'next'}),
                prev  = new Element('input', {type:'button', 'class':'prev'}),
                last  = new Element('input', {type:'button', 'class':'last'}),
                first = new Element('input', {type:'button', 'class':'first'});

            next.observe('click', function() {
                this._goToPage('next');
            }.bind(this));

            prev.observe('click', function() {
                this._goToPage('prev');
            }.bind(this));

            last.observe('click', function() {
                this._goToPage('last');
            }.bind(this));

            first.observe('click', function() {
                this._goToPage('first');
            }.bind(this));

            input.observe('keydown', function(e) {
                if (e.keyCode == 13) {
                    this._goToPage(input.value);
                }
            }.bind(this));

            this.pgNext = next;
            this.pgPrev = prev;
            this.pgLast = last;
            this.pgFirst = first;
            this.pageInput = input;

            ctrls.insert(first);
            ctrls.insert(prev);
            ctrls.insert(input);
            ctrls.insert(next);
            ctrls.insert(last);

            footer.insert(ctrls);
        }

        this.status = status;
        return footer;
    },

    /**
     * Adds thead element to the table
     */
    _createColumns: function () {
        var head = this.table.createTHead(),
            tr = head.insertRow(-1),
            count = 0,
            ignore = 0;
        this._columns.each( function (column, index) {
            if (ignore > 0) {
                ignore--;
                return;
            }
            var th = new Element('th');
            if (column.hidden) {
                th.addClassName('hidden');
                th.setAttribute('width', 0);
            } else {
                if (column.align) {
                    th.setAttribute('align', column.align);
                }
                if (column.width) {
                    th.setAttribute('width', column.width);
                }
                count++;
            }
            Element.insert(tr, th);
            if (column.hasOwnProperty('colSpan')) {
                th.setAttribute('colspan', column.colSpan);
                ignore = column.colSpan - 1;
            }
        }.bind(this));
    },

    /**
     * Adds a new row
     */
    _insertRow: function(data, index) {
        var tr = this.table.tBodies[0].insertRow(index);
        this._createCells(tr, data);
        if (this.options.rowSelect) {
            Event.observe(tr, 'click', function(e) {
                this._selectRow(tr);
                if (this.events.onRowSelect) {
                    this.events.onRowSelect(tr.rowIndex, e);
                }
            }.bind(this));
        }
        if (this.options.mouseRollOver) {
            Event.observe(tr, 'mouseover', function() {
                this._highlightRow(tr);
            }.bind(this));
            Event.observe(tr, 'mouseout', function() {
                this._unHighlightRow(tr);
            }.bind(this));
        }
        if (this.events.onRowOver) {
            Event.observe(tr, 'mouseover', function(e) {
                this.events.onRowOver(tr.rowIndex, e);
            }.bind(this));
        }
        if (this.events.onRowOut) {
            Event.observe(tr, 'mouseout', function(e) {
                this.events.onRowOut(tr.rowIndex, e);
            }.bind(this));
        }
    },

    /**
     * Creates table cells and adds them to the tr
     */
    _createCells: function (tr, rowData) {
        this._columns.each( function(column, index) {
            var cell = tr.insertCell(-1),
                key = Object.isArray(rowData)? index : column.name,
                el = this._createElement(column, rowData[key]);
            if (this.options.colClasses) {
                cell.addClassName('col-' + key);
            }
            if (column.hidden) {
                cell.addClassName('hidden');
            } else {
                if (column.align) {
                    cell.setAttribute('align', column.align);
                }
            }
            if (this.options.cellSelect) {
                Event.observe(cell, 'click', function(e) {
                    this._selectCell(cell);
                    if (this.events.onCellSelect) {
                        this.events.onCellSelect(tr.rowIndex, key, e);
                    }
                }.bind(this));
            }
            Element.insert(cell, el);
        }.bind(this));
    },

    /**
     * Creates required element and assigns it to a cell
     */
    _createElement: function (col, data) {
        var el;
        switch (col.type) {
            case 'id':
                el = data;
                break;
            case 'text':
                if (Object.isString(data) || Object.isNumber(data)) {
                    el = new Element('span').update(data);
                } else {
                    el = new Element('span').update(data.text);
                }
                break;
            case 'currency':
                var value = (Object.isString(data) || !isNaN(data))? data : data.text;
                //value = addCommas(value, this.options.currencySymbol);
                el = new Element('span').update(value);
                break;
            case 'image':
                if (Object.isString(data)) {
                    el = new Element('img', {src:data});
                /*} else if (Object.isArray(data)) {
                    el = [];
                    data.each(function (img) {
                        if (Object.isString(img)) {
                            el.push(new Element('img', {src:img}));
                        } else {
                            var imgEl = new Element('img', {src:img.src});
                            if (img.hasOwnProperty('title')) {
                                imgEl.setAttribute('title', img.title)
                            }
                            el.push(imgEl);
                        }
                    });*/
                } else {
                    el = new Element('img', {src:data.src});
                    if (data.hasOwnProperty('alt')) {
                        el.setAttribute('alt', data.alt)
                    }
                }
                break;
            case 'link':
                if (Object.isString(data)) {
                    el = new Element('a', {href:data}).update(data);
                } else {
                    el = new Element('a', {href:data.href});
                    if (data.hasOwnProperty('text')) {
                        el.update(data.text)
                    }
                    if (data.hasOwnProperty('image')) {
                        el.insert(new Element('img'), {src:data.image})
                    }
                }
                break;
        }
        if (typeof data == 'object') {
            if (data.hasOwnProperty('title')) {
                el.setAttribute('title', data.title)
            }
            if (data.hasOwnProperty('style')) {
                el.setAttribute('style', data.style);
            }
        }
        if (col.onClick) {
            el.observe('click', function() {
               this._onCellClick(el, col.onClick);
            }.bind(this));
        }
        return el;
    },

    /**
     * Trigers on cell click
     */
    _onCellClick: function (el, func) {
        func(el.up('tr').rowIndex);
    },

    /**
     * Inserts data into table
     */
    _load: function(data) {
        if (data) {
            $(this.table.tBodies[0]).update();
            this.data = data;
            // if (typeof this._sortBy !== 'undefined') {
                // this.sort(this._sortBy, this._sortOrder);
            // }
            data.each(function(rowData) {
                this._insertRow(rowData, -1);
            }.bind(this));
        }
        this.refresh();
        //this.render();
    },

    /**
     * Highlights a row on mouse rollover
     */
    _highlightRow: function(rowEl) {
        rowEl.addClassName('hover');
    },

    /**
     * Clears highlighted row
     */
    _unHighlightRow: function(rowEl) {
        rowEl.removeClassName('hover');
    },

    /**
     * Selects a grid row
     */
    _selectRow: function(rowEl) {
        if (typeof this.selectedRow != 'undefined') {
            this._unselectRow(this.selectedRow);
        }
        rowEl.addClassName('selected');
        this.selectedRow = rowEl;
    },

    /**
     * Deselects the grid row
     */
    _unselectRow: function(rowEl) {
        rowEl.removeClassName('selected');
    },

    /**
     * Selects a grid cell
     */
    _selectCell: function(cellEl) {
        if (typeof this.selectedCell != 'undefined') {
            this._unselectRow(this.selectedCell);
        }
        cellEl.addClassName('selected');
        this.selectedCell = cellEl;
    },

    /**
     * Deselects the grid cell
     */
    _unselectCell: function(cellEl) {
        cellEl.removeClassName('selected');
    },

    /**
     * 
     */
    _goToPage: function(page) {
        if (!isNaN(page)) {
            if (page >= 1 || page <= this.maxPageIndex) {
                this._pageIndex = page;
            } else {
                return;
            }
        } else {
            switch (page) {
                case 'next':
                    if (this._pageIndex < this.maxPageIndex) this._pageIndex++; else return; break;
                case 'prev':
                    if (this._pageIndex > 1) this._pageIndex--; else return; break;
                case 'last':
                    if (this._pageIndex < this.maxPageIndex) this._pageIndex = this.maxPageIndex; else return; break;
                case 'first':
                    if (this._pageIndex > 1) this._pageIndex = 1; else return; break;
                default:
                    return;
            }
        }
        this.initFunc(this._pageIndex);
        this._updatePager();
        if (this._backupData !== null) {
            this._backupData = null;
            this.filter(this._filterParams);
        }

        // if (this._pageIndex == this.maxPageIndex) {
            // right.disable();
        // } else {
            // right.enable();
        // }
        // if (this._pageIndex == 1) {
            // left.disable();
        // } else {
            // left.enable();
        // }
    },

    /**
     * 
     */
    _updatePager: function() {
        if (this.footer) {
            if (this.total == 0) {
                this.status.update('');
            } else {
                var from = (this._pageIndex - 1) * this._pageBy + 1,
                    to = this._pageIndex * this._pageBy;
                if (to == 0 || to > this.total) {
                    to = this.total;
                }
                this.status.update(from + ' - ' + to + ' (' + this.total + ')');
                if (this.options.pagination) {
                    this.pageInput.setValue(this._pageIndex);
                }
            }
        }
    },

    /**
     * 
     */
    resetPager: function() {
        this._pageIndex = 1;
        this._updatePager();
    },

/*=============================================================================
/* Public Functions
/*=============================================================================
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
        if (this._pageBy != 0) {
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
            })
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
            })
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
            switch (sortType) {
                case 'num':
                    res = a - b;
                    break;
                default:
                    if (a == b)
                        res = 0;
                    else if (a > b)
                        res = 1;
                    else
                        res = -1;
                    break;
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
        if (index > this.data.length + 1) {
            throw new Error('ProtopackGrid.getRowElement(): Invalid row index');
            return;
        }
        try {
            var tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.getRowElement(): Invalid tr element');
            return;
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
    },

    /**
     * Removes specified row from grid
     */
    deleteRow: function(index) {
        if (index > this.data.length) {
            throw new Error('ProtopackGrid.deleteRow(): Invalid row index');
            return;
        }
        try {
            var tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.deleteRow(): Invalid tr element');
            return;
        }
        tr.remove();
        this.data.splice(index, 1);
        this.refresh();
    },

    /**
     * Updates specified row by givven data
     */
    updateRow: function(index, rowData) {
        if (index > this.data.length) {
            throw new Error('ProtopackGrid.updateRow(): Invalid row index');
            return;
        }
        try {
            var tr = this.table.tBodies[0].rows[--index];
        } catch(err) {
            throw new Error('ProtopackGrid.updateRow(): Invalid tr element');
            return;
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
        if (rowIndex > this.data.length) {
            throw new Error('ProtopackGrid.updateCell(): Invalid row index');
            return;
        }
        try {
            var cell = this.table.tBodies[0].rows[--rowIndex].cells[colIndex-1];
        } catch(err) {
            throw new Error('ProtopackGrid.updateCell(): Invalid cell element');
            return;
        }
        var el = this._createElement(this._columns[colIndex-1], cellData);
        cell.update(el);
        this.data[rowIndex][colIndex] = cellData;
    }

});
