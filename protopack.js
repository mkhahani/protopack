/**
 * Protopack is set of DHTML UI Components based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0dev
 * @url         http://mohsenkhahani.ir/protopack
 */


/**
 * Checks for existance of Prototype JS
 */
if (typeof Prototype === 'undefined' || !Prototype.Version.match('1.7')) {
    throw('Protopack requires Prototype JavaScript framework 1.7.0+');
}

/**
 * Main Protopack namespace
 *
 * @type    object
 * @access  public
 */
var Protopack = Protopack || {
    version: '1.0dev',

    /**
     * Adds `observe` and `fire` methods to passed object
     * Thanks to Ryan Johnson for his LivePipe's Event extension
     */
    extendEvents: function (object) {
        Object.extend(object, {
            initObserve: function (event) {
                this.observers = this.observers || {};
                this.observers[event] = this.observers[event] || [];
            },
            observe: function (event, handler) {
                this.initObserve(event);
                if (!this.observers[event].include(handler)) {
                    this.observers[event].push(handler);
                }
            },
            fire: function (event) {
                this.initObserve(event);
                if (this.observers[event] !== undefined) {
                    for (var i = 0; i < this.observers[event].length; i++) {
                        var args = $A(arguments).slice(1);
                        this.observers[event][i].apply(this, args);
                    }
                }
            }
        });
    }
};

/**
 * Defines Prototype.Browser.IE6 as boolean
 */
if (Object.isUndefined(Prototype.Browser.IE6)) {
	Prototype.Browser.IE6 = (navigator.appName.indexOf("Microsoft Internet Explorer") != -1 && 
                             navigator.appVersion.indexOf("MSIE 6.0") != -1 && 
                             !window.XMLHttpRequest);
}

Element.addMethods({  
    /**
     * Cross browser solution for innerText property
     */
    getInnerText: function (self) {
        self = $(self);
        return (self.innerText && !window.opera)? self.innerText :
            self.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
    }
});

/**
 * Adds commas to a number string
 * From "http://www.mredkj.com/javascript/numberFormat.html" + some improvements
 */
function addCommas(nStr, symbol)
{
	var rgx = /(\d+)(\d{3})/,
        x, x1, x2, res;
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	res = x1 + x2;
    if (!res.blank() && symbol !== undefined) {
        res = symbol + res;
    }
    return res;
}
/**
 * Protopack Input is a base class for other Protopack components
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.2
 * @created     September 17, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - window.js
 */


/**
 * Protopack Input base class
 */
Protopack.Input = Class.create({

    /**
     * Default configuration
     */
    options: {
        className: 'pinput',
        readonly: true,
        buttonStyle: 'smart',  // [disabled, visible, smart]
        dropdownStyle: 'auto'  // [disabled, manually, auto]
    },

    /**
     * Input intializer
     *
     * @param   mixed   target  Container element/ID
     * @param   object  options Input options
     *
     * @return  object  Class instance of Input 
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.buttonStyle = this.options.buttonStyle;
        this.dropdownStyle = this.options.dropdownStyle;
        if (target) {
            this.target = $(target);
            this.xhtml = this.construct();
        }
    },

    construct: function () {
        var xhtml = new Element('div', {'class': this.className});

        this.entry = this.buildEntry();
        xhtml.insert(this.entry);

        if (this.buttonStyle !== 'disabled') {
            this.button = this.buildButton(xhtml);
            xhtml.insert(this.button);
        }

        if (this.dropdownStyle !== 'disabled') {
            this.dropdown = this.buildDropdown(xhtml);
        }

        if (this.target) {
            this.target.insert(xhtml);
        }

        return xhtml;
    },

    buildEntry: function () {
        var entry = (this.entry)? (this.entry) : new Element('input', {type: 'text'});
        if (this.options.readonly) {
            entry.writeAttribute({readonly: true});
        }
        if (this.buttonStyle === 'smart') {
            entry.observe('mousedown', function () { this.button.hide(); }.bind(this));
        }
        entry.observe('mousedown', this.click.bind(this));

        return entry;
    },

    buildButton: function (xhtml) {
        var button = new Element('button');
        if (this.buttonStyle === 'smart') {
            button.hide();
            xhtml.observe('mouseover', function () { button.show(); }.bind(this));
            xhtml.observe('mouseout', function () { button.hide(); }.bind(this));
        }
        button.observe('click', this.buttonClick.bind(this));

        return button;
    },

    buildDropdown: function (xhtml) {
        var options = {
                className: this.className + '-dropdown',
                modal: false,
                draggable: false,
                showHeader: false,
                closeButton: false,
                autoClose: true,
                autoCenter: false
            },
            dropdown = new Protopack.Window(options, xhtml);
        dropdown.excludedElements.push(this.entry);
        return dropdown;
    },

    click: function (e) {
        if (this.dropdownStyle === 'auto' && Event.isLeftClick(e)) {
            this.dropdown.toggle();
        }
    },

    buttonClick: function (e) {
        if (this.dropdownStyle === 'auto') {
            this.dropdown.toggle();
            //Event.stop(e);
        }
    },

    get: function () {
        return this.xhtml;
    },

    grab: function (target) {
        this.entry = $(target);
        this.xhtml.update();
        this.xhtml = this.construct();
    },

    render: function () {
        if (this.dropdown.window.getWidth() < this.entry.getWidth()) {
            this.dropdown.window.style.width = this.entry.getWidth() + 'px';
        }
        this.dropdown.window.style.top = this.entry.getHeight() + 1 + 'px';

        /*if (this.buttonStyle !== 'disabled') {
            var layout = new Element.Layout(this.entry);
            this.button.setHeightTo(this.entry);
            this.button.style.marginTop = layout.get('margin-top') + 'px';
            this.button.style.marginBottom = layout.get('margin-bottom') + 'px';
            this.button.style.paddingTop = layout.get('padding-top') + 'px';
            this.button.style.paddingBottom = layout.get('padding-bottom') + 'px';
        }*/
    },

    setId: function (id) {
        this.entry.id = id;
    },

    setName: function (name) {
        this.entry.name = name;
    },

    setText: function (text) {
        this.entry.value = text;
    },

    openUp: function () {
        this.dropdown.open();
    }
});
/**
 * Protopack Tree is a DHTML tree component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.3
 * @created     October 4, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree base class
 */
Protopack.Tree = Class.create({

    /**
     * Default configuration
     */
    options: {
        className : 'ptree',    // base classname
        interactive : true,     // not implemented yet
        multiSelect : false,    // use of checkboxes or not
        rootId : 0              // ID of the root nodes
    },

    /**
     * Tree initializer
     *
     * @access  private
     * @param   mixed   target  Container element/ID
     * @param   object  options Tree options
     *
     * @return  Object  Class instance of Tree 
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.multiSelect = this.options.multiSelect;
        this.rootId = this.options.rootId;
        this.selected = (this.multiSelect)? [] : null;
        this.nodeById = {};
        this.xhtml = this.construct(target);
        Protopack.extendEvents(this);
    },

    /**
     * Builds tree structure
     *
     * @access  private
     * @param   mixed   target  Container element/ID
     * @return  string  XHTML grid
     */
    construct: function (target) {
        var tree = new Element('div', {'class': this.options.className});
        if (target) {
            $(target).update(tree);
        }

        // Events
        tree.observe('node:click', this.click.bind(this));
        tree.observe('node:mouseover', this.mouseOver.bind(this));
        tree.observe('node:mouseout', this.mouseOut.bind(this));
        tree.observe('node:toggle', this.toggle.bind(this));
        tree.observe('node:create', this.nodeCreate.bind(this));

        return tree;
    },

    /**
     * Loads data and builds the tree
     *
     * @access  public
     * @param   data    Array   Array of nodes which each node is an array itself
     *                          node: [id, pid, text, extra]
     *
     * @return  void
     */
    loadData: function (data) {
        var tree,
            buildData = function (parent, nodeObj) {
                var store = data.partition(function (row) {
                        return row[1] == parent;
                    }),
                    i;
                data = store[1];
                for (i = 0; i < store[0].length; i++) {
                    var row = store[0][i],
                        node = nodeObj.addNode(row[0], row[1], row[2], row[3] || null);
                    if (data.length > 0) {
                        buildData(row[0], node);
                    }
                }
               };

        this.dataObj = new Protopack.Tree.Data(this.rootId, -1, 'root', null);

        buildData(this.rootId, this.dataObj);
        // now dataObj contains whole tree data

        tree = this.createChilds(this.dataObj.childs);
        this.xhtml.update(tree);

        // The most first node
        try {
            tree.down('li').addClassName('first');
        } catch (err) {}
    },

    createNode: function (node, options) {
        var content = null;
        this.fire('tree:nodecreate', node, content);
        nodeObj = new Protopack.Tree.Node(node, content, options);
        nodeObj.element.addClassName('node');
        if (this.multiSelect) {
            if (nodeObj.data.extra.checked) {
                this.selected.push(nodeObj.data.id);
            }
            // NOTE: `selected` doesn't include not loaded nodes
        }
        return nodeObj;
    },

    createChilds: function (nodes) {
        var ul = new Element('ul'),
            options = {multiSelect: this.multiSelect, interactive: this.options.interactive},
            nodeObj;
        //nodes.sort( function (n1, n2) {return n1.data.seq - n2.data.seq;} );
        nodes.each( function (node, i) {
            nodeObj = this.createNode(node, options);
            if (node.childs.length > 0) {
                nodeObj.expander.addClassName('close');
            }
            if (i === nodes.length - 1) {
                nodeObj.outer.addClassName('last');
            }
            ul.insert(nodeObj.outer);
            this.nodeById[node.id] = nodeObj;
        }.bind(this));

        return ul;
    },

    getChilds: function (node) {
        var childEl = node.element.next('ul');
        if (childEl === undefined) {
            childEl = this.createChilds(node.data.childs);
            node.outer.insert(childEl);
        }
        return childEl;
    },

    /**
     * Highlights/Checks given node
     */
    selectNode: function (id) {
        if (this.nodeById[id] === undefined) return;
        if (this.multiSelect) {
            if (this.selected.indexOf(id) === -1) {
                this.selected.push(id);
            }
            this.nodeById[id].data.extra.checked = true;
            this.nodeById[id].element.down('input').checked = true;
        } else {
            this.nodeById[id].element.addClassName('selected');
            this.selected = id;
        }
    },

    /**
     * Un-highlights/Un-checks given node
     */
    deselectNode: function (id) {
        if (this.nodeById[id] === undefined) return;
        if (this.multiSelect) {
            this.nodeById[id].data.extra.checked = false;
            this.nodeById[id].element.down('input').checked = false;
            this.selected.splice(this.selected.indexOf(id), 1);
        } else {
            this.nodeById[id].element.removeClassName('selected');
            this.selected = null;
        }
    }
});
/**
 * Protopack Tree Data is a class for manipulating tree-structred data
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     July 20, 2013
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree Data class
 */
Protopack.Tree.Data = Class.create({

    /**
     * Tree data initializer
     *
     * @access  private
     * @param   string  id      Node's ID
     * @param   string  pid     Node's parent
     * @param   string  text    Node's text
     * @param   mixed   extra   Node's extra data (optional)
     * @return  Object  A class instance of Tree Data
     */
    initialize: function (id, pid, text, extra) {
        this.id = id;
        this.pid = pid;
        this.text = text;
        this.extra = extra || {};
        this.childs = [];
    },

    getNode: function(id) {
        if (this.id == id) {
            return this;
        }

        var res = false;
        this.childs.each(function(child) {
            if (child.id == id) {
                res = child;
                throw $break;
            }
        });

        if (res === false) {
            this.childs.each(function(child) {
                res = child.getNode(id);
                if (res) {
                    throw $break;
                }
            });
        }

        return res;
    },

    addNode: function(id, pid, text, extra) {
        var parent = this.getNode(pid),
            node = new Protopack.Tree.Data(id, pid, text, extra);
        parent.childs.push(node);
        return node;
    },

    deleteNode: function(id) {
        var parent = this.getNode(pid),
            node = new Protopack.Tree.Data(id, pid, text, extra);
        parent.childs.push(node);
        return node;
    },

    getChildren: function(deep) {
        var childs = this.childs.clone();
        if (deep) {
            this.childs.each(function(child) {
                var grandchilds = child.getChildren(true);
                childs = childs.concat(grandchilds);
            });
        }
        return childs;
    }
});
/**
 * Protopack Tree Node is a class for building tree nodes
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2013 Mohsen Khahani
 * @license     MIT
 * @version     1.1
 * @created     July 20, 2013
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree Node class
 */
Protopack.Tree.Node = Class.create({

    /**
     * Tree node initializer
     *
     * @access  private
     * @param   object  node     Class instance of Protopack.Tree.Data
     * @param   string  content  Node inner content (optional)
     * @param   object  options  Node options
     * @return  Object  Class instance of Tree Node
     */
    initialize: function (node, content, options) {
        this.data = node;
        this.inner = content;
        this.options = {};
        Object.extend(this.options, options || {});
        this.outer = this.construct();
    },

    construct: function () {
        var outer = new Element('li'),
            expander = new Element('span'),
            nodeEl = new Element('div');
        if (!this.inner) {
            this.inner = this.buildNode();
        }
        nodeEl.insert(this.inner);
        nodeEl.observe('click', this.click.bind(this));
        nodeEl.observe('mouseover', this.mouseOver.bind(this));
        nodeEl.observe('mouseout', this.mouseOut.bind(this));
        this.element = nodeEl;

        expander.observe('click', this.toggle.bind(this)),
        outer.insert(expander);
        this.expander = expander;

        outer.insert(nodeEl);
        return outer;
    },

    buildNode: function () {
        var content;
        if (this.options.multiSelect) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.data.id});
            content = new Element('div');
            if (typeof this.data.checked != 'undefined') {
                checkbox.writeAttribute({checked: this.data.checked}); // Does not work on IE6
            } else {
                this.data.checked = false;
            }
            content.insert(checkbox);
            content.insert(new Element('label').update(this.data.text));
        } else {
            content = new Element('a').update(this.data.text);
        }
        return content;
    },

    click: function () {
        this.element.fire('node:click', this);
    },

    mouseOver: function () {
        this.element.fire('node:mouseover', this);
    },

    mouseOut: function () {
        this.element.fire('node:mouseout', this);
    },

    toggle: function () {
        this.element.fire('node:toggle', this);
    }
});
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
            if (e.memo.data.extra.checked) {
                this.deselectNode(id);
            } else {
                this.selectNode(id);
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
/**
 * Protopack Tree API
 */
Protopack.Tree.addMethods({

    /**
     * Fetches node object
     *
     * @access  public
     * @param   mixed   Node ID (int/string)
     * @return  object  Node object
     */
    getNode: function (id) {
        return this.nodeById[id];
    },

    setId: function (id) {
        this.xhtml.id = id;
    },

    setClassName: function (className) {
        this.xhtml.className = className;
    },

    /**
     * Adds/Updates tree caption
     *
     * @access  public
     * @param   string  XHTML caption
     * @return  object  Caption element
     */
    setCaption: function (caption) {
        if (this.caption) {
            this.caption.update(caption);
        } else {
            this.caption = new Element('div', {'class': 'caption'}).update(caption);
            this.xhtml.insert({top: this.caption});
        }
        return this.caption;
    },

    /**
     * Expands node
     *
     * @access  public
     * @param   string  id      Node ID to be expanded
     * @param   bool    deep    Whether goes through it's children or not
     * @return  void
     */
    expand: function (id, deep) {
        if (!this.nodeById[id]) {
            return;
        }

        var node = this.nodeById[id];
        this.getChilds(node).show();

        if (node.data.childs.length > 0) {
            node.expander.className = 'open';
        }

        if (deep) {
            node.data.childs.each(function(child) {
                this.expand(child.id, true);
            }, this);
        }
    },

    /**
     * Collapses node
     *
     * @access  public
     * @param   string  id      Node ID to be collapsed
     * @param   bool    deep    Whether goes through it's children or not
     * @return  void
     */
    collapse: function (id, deep) {
        if (!this.nodeById[id]) {
            return;
        }

        var node = this.nodeById[id];
        this.getChilds(node).hide();

        if (node.data.childs.length > 0) {
            node.expander.className = 'close';
        }

        if (deep) {
            node.data.childs.each(function(child) {
                this.collapse(child.id, true);
            }, this);
        }
    },

    /**
     * Expands all nodes
     */
    expandAll: function () {
        this.dataObj.childs.each(function(node) {
            this.expand(node.id, true);
        }, this);
    },

    /**
     * Collapses all nodes
     */
    collapseAll: function () {
        this.dataObj.childs.each(function(node) {
            this.collapse(node.id, true);
        }, this);
    },

    /**
     * Selects given node ID(s)
     */
    select: function (idSet) {
        if (this.multiSelect) {
            idSet = Object.isArray(idSet)? idSet.uniq() : [idSet];
            idSet.each(function (id) {
                this.selectNode(id);
            }, this);
        } else {
            this.selectNode(idSet);
        }
    },

    /**
     * Selects all tree nodes (in multiSelect mode)
     */
    selectAll: function () {
        if (this.multiSelect) {
            this.select(Object.keys(this.nodeById));
        }
    },

    /**
     * Clears selected/checked nodes
     */
    clear: function () {
        if (this.multiSelect) {
            var sel = this.selected.clone();
            for (var i = 0; i < sel.length; i++) {
                this.deselectNode(sel[i]);
            }
            this.selected.clear();
        } else {
            this.deselectNode(this.selected);
        }
    },

    /**
     * Appends a new node as the last child of it's parent
     *
     * @access  public
     * @param   string  id      Node ID
     * @param   string  pid     Node parent ID
     * @param   string  text    Node text
     * @param   object  extra   Extra data (optional)
     * @return  object  Created node
     */
    insertNode: function (id, pid, text, extra) {
        var node,
            nodeObj,
            dataObj,
            container;
        if (pid == '0') {
            dataObj = this.dataObj;
            container = this.xhtml.down('ul');
        } else {
            var parent = this.nodeById[pid];
            if (!parent) {
                return;
            }
            dataObj = parent.data;
            container = this.getChilds(parent);
            parent.expander.className = 'open';
        }
        node = dataObj.addNode(id, pid, text, extra);
        nodeObj = this.createNode(node);
        container.insert(nodeObj.outer);
        nodeObj.outer.addClassName('last');
        this.nodeById[id] = nodeObj;
        try {
            nodeObj.outer.previous('li').removeClassName('last');
        } catch(err) {}

        return nodeObj;
    },

    /**
     * Removes node from tree
     *
     * @access  public
     * @param   string  id      Node ID
     * @return  object  bool    True on success and false otherwise
     */
    deleteNode: function (id) {
        var nodeObj = this.nodeById[id],
            dataObj,
            index,
            pid;
        if (!nodeObj) {
            return false;
        }
        pid = nodeObj.data.pid;
        try {
            if (pid == '0') {
                dataObj = this.dataObj;
            } else {
                var parent = this.nodeById[pid];
                if (!parent) {
                    return;
                }
                dataObj = parent.data;
                var container = nodeObj.outer.up('ul');
                if (container.children.length === 1) {
                    parent.expander.className = '';
                } else {
                    if (!nodeObj.outer.next('li')) {
                        var prev = nodeObj.outer.previous('li');
                        if (prev) {
                            prev.className = 'last';
                        }
                    }
                }
            }
            nodeObj.outer.remove();
            index = dataObj.childs.indexOf(nodeObj.data);
            dataObj.childs.splice(index, 1);
            delete this.nodeById[id];
        } catch(err) {return false;}

        return true;
    },

    updateNode: function (id, node) {
    }
});
/**
 * Protopack TreeSelect is a DHTML tree combobox component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.2
 * @created     October 5, 2011
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - Protopack Input
 *    - Protopack Tree
 */


/**
 * TreeSelect base class
 */
Protopack.TreeSelect = Class.create(Protopack.Input, {

    /**
     * Default configuration
     */
    options: {
        className: 'ptreeselect', // base classname
        interactive: false,       // not implemented yet
        multiSelect: false,       // use of checkboxes or not
        fullPath: true,           // display full path of selected node (single mode)
        pathSep: ' > '            // Path separator
    },

    /**
     * TreeSelect initializer
     *
     * @param   mixed   target  Container element/ID
     * @param   object  options TreeSelect options
     *
     * @return  Object  Class instance of TreeSelect
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.options.readonly = true;
        this.className = this.options.className;
        this.multiSelect = this.options.multiSelect;
        this.buttonStyle = 'disabled';
        this.dropdownStyle = 'auto';
        this.value = [];
        this.xhtml = this.construct();
        if (target) {
            $(target).insert(this.xhtml);
            //this.render();
        }
        Protopack.extendEvents(this);
    },

    construct: function ($super) {
        var xhtml = $super();
            entry = new Element('input', {type:'hidden'});
            options = {
                multiSelect: this.multiSelect, 
                interactive:this.options.interactive
            },
            tree = new Protopack.Tree(null, options);
        tree.observe('tree:click', this.select.bind(this));
        this.valueEntry = entry;
        this.tree = tree;
        xhtml.insert(entry);
        return xhtml.insert(this.dropdown.setContent(tree.xhtml));
    },

    select: function (node) {
        if (this.multiSelect) {
            this.value = this.valueEntry.value = this.tree.selected;
        } else {
            this.value = this.valueEntry.value = node.data.id;
            this.dropdown.close();
        }
        this.text = this.entry.value = this.fetchText(this.tree.selected);
        this.fire('treeselect:change', this.value);
    },

    /**
     * Returns text of given node ID's
     */
    fetchText: function (idSet) {
        var res = [];
        if (Object.isArray(idSet)) {
            idSet.each(function (id) {
                var node = this.tree.getNode(id);
                if (node) {
                    res.push(node.data.text);
                }
            }, this);
            return res.join(', ');
        } else {
            var node = this.tree.getNode(idSet);
            if (node) {
                if (this.options.fullPath) {
                    var id = idSet;
                    while (id != '0') {
                        res.push(this.tree.getNode(id).data.text);
                        id = this.tree.getNode(id).data.pid;
                    }
                    return res.reverse().join(this.options.pathSep);
                } else {
                    return node.data.text;
                }
            }
        }
        return null;
    },

    loadData: function (data) {
        this.tree.loadData(data);
        this.render();
    },

    setId: function (id) {
        this.xhtml.id = id;
    },

    setValue: function (value) {
        this.tree.select(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
        this.text = this.fetchText(value);
        this.entry.value = this.text;
    },

    /**
     * Selects all tree nodes (in multiSelect mode)
     */
    selectAll: function () {
        this.tree.selectAll();
        this.setValue(this.tree.selected);
    },

    clear: function () {
        this.tree.clear();
        this.value = this.valueEntry.value = this.tree.selected;
        this.entry.value = this.text = '';
    },

    insertNode: function (node) {
        this.tree.insertNode(node);
    },

    deleteNode: function (id) {
        this.tree.deleteNode(id);
    },

    updateNode: function (id, node) {
        this.tree.updateNode(id, node);
    }

});
/**
 *  Protopack Draggable is a drag & drop library based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2012-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     May 6, 2012
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Draggable base class
 */
Protopack.Draggable = Class.create({

    /**
     * Default configuration
     */
    options: {
        transparent: true
    },

    /**
     * The intializer
     */
    initialize: function(draggableEl, clickableEl, options) {
        if (draggableEl === undefined) {
            return;
        }
        if (clickableEl === undefined) {
            clickableEl = draggableEl;
        }
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});

        this.dragObj = draggableEl;
        this.clickObj = clickableEl;
        this.goDragFunc = this.goDrag.bindAsEventListener(this);
        this.stopDragFunc = this.stopDrag.bindAsEventListener(this);
        Event.observe(clickableEl, 'mousedown', this.startDrag.bindAsEventListener(this));
    },

    startDrag: function(e) {
        if (Event.isLeftClick(e)) {
            this.cursorOffset = [
                Event.pointerX(e) - this.dragObj.offsetLeft,
                Event.pointerY(e) - this.dragObj.offsetTop
            ];
            Event.observe(document, 'mousemove', this.goDragFunc);
            Event.observe(this.clickObj, 'mouseup', this.stopDragFunc);
            Event.stop(e);
            this.dragObj.absolutize();
            if (this.options.transparent) {
                this.dragObj.setOpacity(0.9);
            }
        }
    },

    stopDrag: function(e) {
        Event.stopObserving(document, 'mousemove', this.goDragFunc);
        Event.stopObserving(this.clickObj, 'mouseup', this.stopDragFunc);
        this.dragObj.relativize();
        if (this.options.transparent) {
            this.dragObj.setOpacity(1);
        }
    },

    goDrag: function(e) {
        var x = Event.pointerX(e),
            y = Event.pointerY(e);
        this.dragObj.style.left = x - this.cursorOffset[0] + 'px';
        this.dragObj.style.top  = y - this.cursorOffset[1] + 'px';
        Event.stop(e);
    }
});
/**
 *  Protopack Window is a DHTML Window Component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2012-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.3
 * @created     May 6, 2012
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - Protopack Draggable (optional)
 */


/**
 * Protopack Window base class
 */
Protopack.Window = Class.create({

    /**
     * Default configuration
     */
    options: {
        className       : 'pwindow',
        modal           : true,
        draggable       : true,
        transparentDrag : true,
        escape          : true,
        autoClose       : false,
        showHeader      : true,
        closeButton     : true,
        autoCenter      : true
    },

    /**
     * Window intializer
     *
     * @access  private
     * @param   object  options Window options
     * @param   string  target  ID of the target element
     * @return  void
     */
    initialize: function (options, target) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.focusHandler = this.onLostFocus.bind(this);
        this.escapeHandler = this.onEscape.bind(this);
        this.excludedElements = [];     // don't fire onLostFocus() for these elements
        target = (target === undefined)? document.body : $(target);

        if (this.window) {
            this.destroy();
        }
        this.window = this.construct(target);
        this.setPosition();
    },

    /**
     * Window constructor
     *
     * @access  private
     * @param   string  target  ID of the target element
     * @return  string  XHTML window
     */
    construct: function (target) {
        var window = this.buildWindow();

        if (this.options.modal) {
            this.overlay = this.buildOverlay(target);
        }

        if (this.options.showHeader) {
            this.header = this.buildHeader();
            window.insert(this.header);
        }

        this.body = this.buildBody();
        window.insert(this.body);

        if (this.options.closeButton) {
            window.insert(this.buildClose());
        }

        target.insert(window);

        if (this.options.draggable) {
            if (typeof Protopack.Draggable !== 'undefined') {
                new Protopack.Draggable(window,
                                       this.header? this.header : window, 
                                       {transparent: this.options.transparentDrag});
            } else if (typeof Draggable !== 'undefined') {
                var options = {};
                if (!this.options.transparentDrag) {
                    options = {starteffect:false, endeffect:false};
                }
                new Draggable(window, options);
            }
        }

        return window;
    },

    /**
     * Builds the main window
     *
     * @access  private
     * @return  object  Window element
     */
    buildWindow: function () {
        return new Element('div', {'class': this.className}).hide();
    },

    /**
     * Builds the screen overlay
     *
     * @access  private
     * @return  object  Overlay element
     */
    buildOverlay: function (target) {
        var overlay = new Element('div', {'class': this.className + '-overlay'});
        overlay.style.position = (target === document.body)? 'fixed' : 'absolute';
        overlay.observe('mousedown', function (e) {
            if (this.options.autoClose) {
                this.close();
            } else {
                Event.stop(e);
            }
        }.bind(this));
        target.insert(overlay.hide());
        return overlay;
    },

    /**
     * Builds the header of the window
     *
     * @access  private
     * @return  object  Window header element
     */
    buildHeader: function () {
        var header = new Element('div', {'class': this.className + '-header'}),
            title = new Element('div', {'class': this.className + '-title'});
        this.title = title;

        return header.insert(title);
    },

    /**
     * Builds the body of the window
     *
     * @access  private
     * @return  object  Window body element
     */
    buildBody: function () {
        var body = new Element('div', {'class': this.className + '-body'}),
            content = new Element('div', {'class': this.className + '-content'});
        this.content = content;

        return body.insert(content);
    },

    /**
     * Builds the close button
     *
     * @access  private
     * @return  object  Close button element
     */
    buildClose: function () {
        var btnClose = new Element('span', {'class': this.className + '-close'});
        btnClose.observe('click', this.close.bind(this));
        return btnClose;
    },

    /**
     * Creates some events on document
     *
     * @access  private
     * @return  void
     */
    startDocEvents: function () {
        if (this.options.autoClose) {
            document.observe('mousedown', this.focusHandler);
        }
        if (this.options.escape) {
            document.observe('keydown', this.escapeHandler);
        }
    },

    /**
     * Removes document events
     *
     * @access  private
     * @return  void
     */
    stopDocEvents: function () {
        document.stopObserving('mousedown', this.focusHandler);
        document.stopObserving('keydown', this.escapeHandler);
    },

    /**
     * Closes the window on ecape key press
     *
     * @access  private
     * @param   object  e   Keybord event
     * @return  void
     */
    onEscape: function (e) {
        if (this.window.visible() && e.keyCode === Event.KEY_ESC) {
            this.close();
        }
    },

    /**
     * Closes the window when focus is lost on mouse click
     *
     * @access  private
     * @param   object  e   Mouse event
     * @return  void
     */
    onLostFocus: function (e) {
        var el = e.findElement();
        if (this.window.visible() && this.window !== el &&
            this.window.descendants().indexOf(el) === -1 &&    // => click outside of Window
            this.excludedElements.indexOf(el) === -1)
        {
            this.close();
        }
    },

    /**
     * Positions the window
     *
     * @access  private
     * @param   int     x   Window left position(px) - optional
     * @param   int     y   Window top position(px) - optional
     * @return  void
     */
    setPosition: function (x, y) {
        if (x !== undefined && y !== undefined) {
            try {
                this.window.style.left = x + 'px';
                this.window.style.top  = y + 'px';
            } catch(err) {
                throw 'Could not set window position.';
            }
        } else if (this.options.autoCenter) {
            var width  = this.window.getWidth(),
                height = this.window.getHeight(),
                offset,
                dim;
            if (this.window.parentNode === document.body) {
                dim = document.viewport.getDimensions();
                offset = document.viewport.getScrollOffsets();
                dim.width += 2 * offset.left;
                dim.height += 2 * offset.top;
            } else {
                dim = this.window.parentNode.getDimensions();
            }
            this.window.style.left = (width > dim.width)? 0 : Math.round(dim.width / 2 - width / 2) + 'px';
            this.window.style.top = (height > dim.height)? 0 : Math.round(dim.height / 2 - height / 2) + 'px';
        }
    },

    /**
     * Sets ID of the window element
     *
     * @access  public
     * @param   string  id  Window ID
     * @return  void
     */
    setId: function (id) {
        this.window.id = id;
    },

    /**
     * Sets title of the window
     *
     * @access  public
     * @param   string  title   Window title
     * @return  void
     */
    setTitle: function (title) {
        if (this.title) {
            this.title.update(title);
        }
    },

    /**
     * Sets content of the window
     *
     * @access  public
     * @param   string  content XHTML window content
     * @return  void
     */
    setContent: function (content) {
        this.content.update(content);
    },

    /**
     * Sets width & height of the window
     *
     * @access  public
     * @param   int     width   Window width(px)
     * @param   int     Height  Window height(px)
     * @return  void
     */
    setSize: function (width, height) {
        this.window.style.width = width + 'px';
        this.window.style.height = height + 'px';
    },

    /**
     * Shows the window (at the specified position)
     *
     * @access  public
     * @param   int   x   Window left position(px) - optional
     * @param   int   y   Window top position(px) - optional
     * @return  void
     */
    open: function (x, y) {
        if (x !== undefined && y !== undefined) {
            this.setPosition(x, y);
        }
        this.window.show();
        if (this.options.modal) {
            this.overlay.show();
        }
        this.startDocEvents();
    },

    /**
     * Hides the window
     *
     * @access  public
     * @return  void
     */
    close: function () {
        this.stopDocEvents();
        this.window.hide();
        if (this.overlay) {
            this.overlay.hide();
        }
        if (this.onClose) {
            this.onClose();
        }
    },

    /**
     * Opens/Closes the window
     *
     * @access  public
     * @return  void
     */
    toggle: function () {
        if (this.window.visible()) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Destroys the window
     *
     * @access  public
     * @return  void
     */
    destroy: function () {
        this.window.remove();
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
});
