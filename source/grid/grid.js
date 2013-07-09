/**
 * Protopack Grid is a DHTML Grid Component based on Prototype JS framework
 * Copyright 2011-2013 Mohsen Khahani
 * Licensed under the MIT license
 * Created on July 10, 2011
 *
 * Dependencies:
 *   - Prototype JS Framework v1.7+
 *
 * Features:
 *   - rich JavaScript data grid
 *
 * http://mohsenkhahani.ir/protopack
 */


/**
 * Protopack Grid base class
 */
Protopack.Grid = Class.create({
    version: '1.3',

    /**
     * Default configuration
     */
    options: {
        className     : 'pgrid',
        header        : true,
        footer        : true,
        sorting       : 'client',   // ['client', 'server', false]
        filtering     : false,      // ['client', 'server', false]
        pagination    : false,      // depends on footer
        keyboard      : false,      // depends on rowSelect/cellSelect
        rowSelect     : true,
        cellSelect    : false,
        rowHover      : false,
        cellHover     : false,
        rowClasses    : false,
        colClasses    : false,
        oddEvenRows   : false,
        currencySymbol: '$'
    },

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
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.events = events || {};
        this._columns = layout || [];
        this._columns.each(function (col) {
            columnsByName[col.name] = col;
        });
        this._columnsByName = columnsByName;
        this._className = this.options.className;
        this._pageIndex = 1;
        this._pageBy = 0;
        this._backupData = null;

        this.grid = this._construct(target);
        Protopack.extendEvents(this);
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
        body.tabIndex = '1';
        body.observe('click', this._click.bind(this));
        body.observe('dblclick', this._dblClick.bind(this));
        body.observe('mouseover', this._mouseOver.bind(this));
        body.observe('mouseout', this._mouseOut.bind(this));
        if (this.options.keyboard) {
            body.observe('keydown', this._keyDown.bind(this));
        }
        this.body = body;
        this.table = table;
        this._createColumns();
        grid.insert(this.body);

        // Grid Footer
        if (this.options.footer) {
            this.footer = this._createFooter();
            grid.insert(this.footer);
        }

        $(target).insert(grid);
        return grid;
    },

    /**
     * Adds header to grid
     */
    _createHeader: function () {
        var header = new Element('div', {'class':this._className + '-header'}),
            table = new Element('table'),
            trTitles = table.insertRow(-1),
            trFilter = table.insertRow(-1),
            ignore = 0;

        // Titles
        this._columns.each( function (column) {
            if (ignore > 0) {
                ignore--;
                return;
            }
            var th = new Element('th');
            if (column.hidden) {
                th.addClassName('hidden');
                th.setAttribute('width', 0);
            } else {
                th.addClassName('t-' + column.name);
                if (column.image) {
                    th.insert(new Element('img', {src:column.image}));
                }
                if (column.width) {
                    th.setAttribute('width', column.width);
                }
                if (this.options.sorting && column.sortType) {
                    th.addClassName('sortable');
                }
            }
            trTitles.className = 'titles';
            Element.insert(trTitles, th.insert(column.title));
            if (column.hasOwnProperty('colSpan')) {
                th.setAttribute('colspan', column.colSpan);
                ignore = column.colSpan - 1;
            }
        }.bind(this));
        if (this.options.sorting) {
            Event.observe(trTitles, 'click', this._sort.bind(this));
        }

        // Filter
        if (this.options.filtering) {
            var form = new Element('form');
            header.insert(form.insert(table));
            ignore = 0;
            trFilter.className = 'filters';
            this._columns.each( function (column) {
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
                        var filterFunc = (this.options.filtering === 'client')? this.filter:
                                                                                this.events.onFilter;
                        switch (column.filter) {
                            case 'text':
                                var input = new Element('input', {name:column.name});
                                if (column.width) {
                                    input.style.width = column.width + 'px';
                                }
                                td.insert(input);
                                break;
                            case 'list':
                                var select = new Element('select', {name:column.name});
                                select.style.width = column.width + 'px';
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
            Event.observe(trFilter, 'change', this._filter.bind(this));
        } else {
            header.insert(table);
        }

        return header;
    },

    /**
     * Adds thead element to the table
     */
    _createFooter: function () {
        var footer = new Element('div', {'class':this._className + '-footer'});
            
        if (this.options.pagination) {
            var pager = new Element('table', {'class':this._className + '-pager'}),
                tr = pager.insertRow(-1),
                status = new Element('span', {'class':this._className + '-status'}),
                input = new Element('input', {type:'text', value:'1'}),
                first = new Element('input', {type:'button', 'class':'first'}),
                prev = new Element('input', {type:'button', 'class':'prev'}),
                next = new Element('input', {type:'button', 'class':'next'}),
                last = new Element('input', {type:'button', 'class':'last'});

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
                if (e.keyCode === 13) {
                    this._goToPage(input.value);
                }
            }.bind(this));

            this.pgNext = next;
            this.pgPrev = prev;
            this.pgLast = last;
            this.pgFirst = first;
            this.pageInput = input;
            this.status = status;

            pager.insert(new Element('tr'));
            tr.insert(new Element('td').insert(status));
            tr.insert(new Element('td').insert(first));
            tr.insert(new Element('td').insert(prev));
            tr.insert(new Element('td').insert(input));
            tr.insert(new Element('td').insert(next));
            tr.insert(new Element('td').insert(last));
            footer.insert(pager);
        }

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
        return tr;
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
                cell.addClassName('c-' + key);
            }
            if (column.hidden) {
                cell.addClassName('hidden');
            } else {
                if (column.align) {
                    cell.setAttribute('align', column.align);
                }
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
                value = addCommas(value, this.options.currencySymbol);
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
                        el.setAttribute('alt', data.alt);
                    }
                }
                break;
            case 'link':
                if (Object.isString(data)) {
                    el = new Element('a', {href:data}).update(data);
                } else {
                    el = new Element('a', {href:data.href});
                    if (data.hasOwnProperty('text')) {
                        el.update(data.text);
                    }
                    if (data.hasOwnProperty('image')) {
                        el.insert(new Element('img'), {src:data.image});
                    }
                }
                break;
        }
        if (typeof data == 'object') {
            if (data.hasOwnProperty('title')) {
                el.setAttribute('title', data.title);
            }
            if (data.hasOwnProperty('style')) {
                el.setAttribute('style', data.style);
            }
        }
        return el;
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
    /**
     * Highlights a cell on mouse rollover
     */
    _highlightCell: function(cellEl) {
        cellEl.addClassName('hover');
    },

    /**
     * Clears highlighted cell
     */
    _unHighlightCell: function(cellEl) {
        cellEl.removeClassName('hover');
    },

    /**
     * Selects a grid row or clears the selection if null is passed
     */
    _selectRow: function(rowEl) {
        if (this.selectedRow) {
            this.selectedRow.removeClassName('selected');
        }
        if (rowEl) {
            rowEl.addClassName('selected');
        }
        this.selectedRow = rowEl;
    },

    /**
     * Selects a grid cell or clears the selection if null is passed
     */
    _selectCell: function(cellEl) {
        if (this.selectedCell) {
            this.selectedCell.removeClassName('selected');
        }
        if (cellEl) {
            cellEl.addClassName('selected');
        }
        this.selectedCell = cellEl;
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
            if (this.total === 0) {
                this.status.update('');
            } else {
                var from = (this._pageIndex - 1) * this._pageBy + 1,
                    to = this._pageIndex * this._pageBy;
                if (to === 0 || to > this.total) {
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
    }
});
