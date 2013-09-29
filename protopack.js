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
 * Protopack Tree base class
 */
Protopack.Tree = Class.create({

    /**
     * Default configuration
     */
    options: {
        className : 'ptree',    // base classname
        interactive : true,     // not implemented yet
        includeRoot : true,     // tree has a root node
        rootId : 0,             // ID of the root node
        multiSelect : false,    // use of checkboxes or not
        relativeNodes : true    // selecting a node affects relative nodes (multiSelect mode)
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

        this.dataObj = new Protopack.Tree.Data(this.rootId, this.rootId - 1, '/', null);
        buildData(this.rootId, this.dataObj);
        // now dataObj contains whole tree data

        if (this.options.includeRoot) {
            this.nodeById[this.rootId] = this.dataObj;
            tree = this.createChilds([this.dataObj]);
        } else {
            tree = this.createChilds(this.dataObj.childs);
        }
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
            this.nodeById[id].data.checked = true;
            if (this.selected.indexOf(id) === -1) {
                this.selected.push(id);
            }
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
            this.nodeById[id].data.checked = false;
            this.selected.splice(this.selected.indexOf(id), 1);
        } else {
            this.nodeById[id].element.removeClassName('selected');
            this.selected = null;
        }
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
            var checked = e.memo.checkbox.checked;
            if (checked) {
                this.selectNode(id);
            } else {
                this.deselectNode(id);
            }

            if (this.options.relativeNodes) {
                // update children
                var childs = e.memo.data.getChildren(true),
                    ul = e.memo.element.next('ul');
                if (ul) {
                    ul.select('input').each(function (input) {
                        input.checked = checked;
                    });
                }
                childs.each(function (child) {
                    if (checked) {
                        this.selectNode(child.id);
                    } else {
                        this.deselectNode(child.id);
                    }
                }, this);

                // update parent hierarchy
                var pid = e.memo.data.pid;
                while (pid != 0) {
                    var parent = this.nodeById[pid],
                        childsChecked = false;
                    if (!parent) {
                        break;
                    }
                    parent.data.childs.each(function(child) {
                        childsChecked = childsChecked || child.checked;
                    });
                    parent.checkbox.checked = childsChecked;
                    if (childsChecked) {
                        this.selectNode(parent.data.id);
                    } else {
                        this.deselectNode(parent.data.id);
                    }
                    pid = parent.data.pid;
                }
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
        if (this.options.includeRoot) {
            this.expand(this.rootId, true);
        } else {
            this.dataObj.childs.each(function(node) {
                this.expand(node.id, true);
            }, this);
        }
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
        nodeEl.observe('mouseover', this.mouseOver.bind(this));
        nodeEl.observe('mouseout', this.mouseOut.bind(this));
        if (!this.options.multiSelect) {
            nodeEl.observe('click', this.click.bind(this));
        }
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
            checkbox.observe('click', this.click.bind(this));
            content.insert(checkbox);
            content.insert(new Element('label').update(this.data.text));
            this.checkbox = checkbox;
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
 * TreeSelect base class
 */
Protopack.TreeSelect = Class.create(Protopack.Input, {

    /**
     * Default configuration
     */
    options: {
        className: 'ptreeselect', // base classname
        interactive: false,       // not implemented yet
        includeRoot: false,       // the tree has a root node
        multiSelect: false,       // use of checkboxes or not
        relativeNodes: true,      // selecting a node affects relative nodes (multiSelect mode)
        fullPath: true,           // display full path of selected node (single mode)
        pathSep: ' > ',           // Path separator
        defaultText: ''           // Default text when value is null
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
        this.setText(this.options.defaultText);
        if (target) {
            $(target).insert(this.xhtml);
            this.render();
        }
        Protopack.extendEvents(this);
    },

    construct: function ($super) {
        var xhtml = $super();
            entry = new Element('input', {type:'hidden'});
            options = {
                interactive: this.options.interactive,
                includeRoot: this.options.includeRoot,
                multiSelect: this.multiSelect,
                relativeNodes: this.options.relativeNodes
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
        this.setText(this.fetchText(this.value));
        this.fire('treeselect:change', this.value);
    },

    /**
     * Returns text of given node ID's
     */
    fetchText: function (idSet) {
        var res = [];
        if (idSet.length === 0) {
            return this.options.defaultText;
        }
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
                    while (node) {
                        res.push(node.data.text);
                        node = this.tree.getNode(node.data.pid);
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

    setName: function (name) {
        this.valueEntry.name = name;
    },

    setText: function (text) {
        this.text = text;
        this.entry.value = text;
        this.entry.title = text;
    },

    setValue: function (value) {
        this.tree.clear();
        this.tree.select(value);
        this.value = this.valueEntry.value = value = this.tree.selected;
        this.setText(this.fetchText(this.value));
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
        this.setText(this.options.defaultText);
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
        if (!this.window.style.left) {
            this.setPosition(x, y);
        }
        // if (x !== undefined && y !== undefined) {
            // this.setPosition(x, y);
        // }
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

/**
 * Protopack Tabs base class
 */
Protopack.Tabs = Class.create({

    /**
     * Default configuration
     */
    options: {
        className: 'ptabs',
        findTabs: true,
        hover: false,
        defaultTab: 1
    },

    /**
     * Tabs intializer
     *
     * @access  private
     * @param   mixed   target  Container element/ID
     * @param   object  options
     * @return  Clss instance of Tabs
     */
    initialize: function (target, options) {
        if (!$(target)) {
            throw new Error('Protopack.Tabs.initialize(): Could not find the target element "' + target + '".');
        }
        this.target = $(target);
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        if (this.options.findTabs) { this.construct(); }
    },

    /**
     * Builds tabs
     *
     * @access  private
     * @return  void
     */
    construct: function () {
        var links = this.target.select('li a');
        this.tabs = this.target.select('li').invoke('addClassName', this.options.className + '-tab');
        this.sheets = links.map(function (link) {return $(link.rel);});
        links.invoke('observe', 'click', this.switchTab.bind(this));
        if (this.options.hover) {
            links.invoke('observe', 'mouseover', this.switchTab.bind(this));
        }
        this.reset();
        this.setActive(this.options.defaultTab);
        this.target.addClassName(this.options.className);
    },

    /**
     * Creates tabs by passed tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    createTabs: function (tabs) {
        var ul = new Element('ul').addClassName(this.options.className);
        this.sheets = tabs.map(function (tab) {return $(tab[0]);});
        this.tabs = tabs.map(function (tab) {
            var a = new Element('a', {rel:tab[0]}).update(tab[1]),
                li = new Element('li').insert(a);
            a.observe('click', this.switchTab.bind(this));
            if (this.options.hover) {
                a.observe('mouseover', this.switchTab.bind(this));
            }
            li.addClassName(this.options.className + '-tab');
            ul.insert(li);
            return li;
        }.bind(this));
        return ul;
    },

    /**
     * Switches to the clicked/hovered tab
     *
     * @param   object  e   mouse event (click or mouseover)
     */
    switchTab: function (e) {
        var link = Event.findElement(e);
        this.reset();
        $(link.rel).show();
        link.up('li').addClassName('active');
    },

    /**
     * Deselects tabs and hides all sheets
     */
    reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClassName', 'active');
    },

    /**
     * Creates tabs by passing tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    setTabs: function (tabs) {
        this.target.insert({top: this.createTabs(tabs)});
        this.reset();
        this.setActive(this.options.defaultTab);
    },

    /**
     * Selects a tab and displays related sheet
     *
     * @param   integer index   tab index, begins from 1
     */
    setActive: function (index) {
        this.reset();
        this.tabs[index - 1].addClassName('active');
        this.sheets[index - 1].show();
    }
});

/**
 * Protopack Grid base class
 */
Protopack.Grid = Class.create({

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
        oddEvenRows   : true,
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
                if (this.options.pagination) {
                    this.status.update(from + ' - ' + to + ' (' + this.total + ')');
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
                tr.addClassName('r-' + i);
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
     * Clears all selected rows/cells
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

/**
 * Protopack Select base class
 */
Protopack.Select = Class.create(Protopack.Input, {

    /**
     * Default configuration
     */
    options: {
        className: 'pselect',
        readonly: false,
        listSize: 8
    },

    /**
     * Select initializer
     *
     * @param   mixed   target  Container element/ID
     * @param   object  options Select options
     *
     * @return  Object  Class instance of Select
     */
    initialize: function (target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.readonly = this.options.readonly;
        this.buttonStyle = 'disabled';
        this.dropdownStyle = 'auto';
        if (target) {
            this.target = $(target);
            this.xhtml = this.construct();
        }
    },

    construct: function ($super) {
        var xhtml = $super();
        this.listBox = this.buildListBox();
        this.dropdown.setContent(this.listBox);
        this.render();
        return xhtml;
    },

    buildListBox: function () {
        var listBox = new Element('select', {size:0});
        if (listBox.selectedIndex !== -1) {
            this.entry.value = listBox.options[listBox.selectedIndex].text;
        }
        listBox.observe('click', this.selectItem.bind(this));
        return listBox;
    },

    selectItem: function (e) {
        if (this.listBox.selectedIndex !== -1) {
            this.entry.value = this.listBox.options[this.listBox.selectedIndex].text;
        }
        this.dropdown.close();
    },

    render: function ($super) {
        $super();
        this.listBox.size = (this.listBox.options.length < this.options.listSize)?
            this.listBox.options.length : this.options.listSize;
    },

    setData: function (data) {
        if (Object.isArray(data)) {
            data.each(function (row) {
                this.listBox.options[this.listBox.options.length] = new Option(row[1], row[0]);
            }.bind(this));
        } else {
            this.listBox = $(data);
            this.dropdown.setContent(this.listBox);
        }
        this.render();
    }
});
