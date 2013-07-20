/**
 * Protopack Tree Node is a class for building tree node
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
 * Protopack Tree Node class
 */
Protopack.Tree.Node = Class.create({

    /**
     * Tree node initializer
     *
     * @access  private
     * @param   array   node [id, pid, text, data]
     * @param   object  options
     * @return  Object  A class instance of TreeNode
     */
    initialize: function (node, options) {
        this.id   = node.id;
        this.pid  = node.pid;
        this.text = node.text;
        this.data = node.data || {};
        // this.style       = node[4] || {};
        // this.seq         = this.attrib.seq || 0;
        this.li    = this._construct(options);
        this.eventParams = {id:this.id, pid:this.pid, text:this.text, element:this.div};
    },

    _construct: function (options) {
        var container = new Element('li'),
            nodeItem  = new Element('div'),
            textEl;
        if (options.multiSelect) {
            var checkbox = new Element('input', {type: 'checkbox', value: this.id});
            textEl = new Element('label').update(this.text);
            if (typeof this.data.checked != 'undefined') {
                checkbox.writeAttribute({checked: this.data.checked}); // Does not work on IE6
            } else {
                this.data.checked = false;
            }
            nodeItem.insert(checkbox);
        } else {
            textEl = new Element('a').update(this.text);
            if (typeof this.data.href != 'undefined') {
                textEl.writeAttribute({href: this.data.href});
                if (typeof this.data.target != 'undefined') {
                    textEl.writeAttribute({target: this.data.target});
                }
            }
        }
        nodeItem.insert(textEl);
        if (typeof this.data.id != 'undefined') nodeItem.writeAttribute({id: this.data.id});
        if (typeof this.data.title != 'undefined') nodeItem.writeAttribute({title: this.data.title});
        if (typeof this.data.dir != 'undefined') nodeItem.writeAttribute({dir: this.data.dir});
        if (typeof this.data.className != 'undefined') nodeItem.addClassName(this.data.className);
        if (typeof this.data.style != 'undefined') nodeItem.setStyle(this.data.style);
        nodeItem.observe('click', this._onClick.bind(this));
        nodeItem.observe('mouseover', this._onMouseOver.bind(this));
        nodeItem.observe('mouseout', this._onMouseOut.bind(this));

        if (options.interactive) {
            var expander = new Element('span');
            expander.observe('click', this._onToggleNode.bind(this)),
            container.insert(expander);
        }
        this.div = nodeItem;
        container.insert(nodeItem);

        return container;
    },

    _onClick: function (e) {
        e.element().fire('node:click', this.eventParams);
    },

    _onMouseOver: function (e) {
        e.element().fire('node:mouseover', this.eventParams);
    },

    _onMouseOut: function (e) {
        e.element().fire('node:mouseout', this.eventParams);
    },

    _onToggleNode: function (e) {
        e.element().fire('node:toggle', this.eventParams);
    }
});