/**
 * Protopack Tree Node is a class for building tree nodes
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
     * @return  Object  A class instance of Tree Node
     */
    initialize: function (node, options) {
        this.id   = node.id;
        this.pid  = node.pid;
        this.text = node.text;
        this.data = node.data || {};
        this.innerHTML = node.innerHTML;
        this.outer = this.construct(options);
    },

    construct: function (options) {
        var container = new Element('li'),
            nodeItem  = new Element('div'),
            innerHTML;
        if (!this.innerHTML) {
            if (options.multiSelect) {
                var checkbox = new Element('input', {type: 'checkbox', value: this.id});
                innerHTML = new Element('div');
                if (typeof this.data.checked != 'undefined') {
                    checkbox.writeAttribute({checked: this.data.checked}); // Does not work on IE6
                } else {
                    this.data.checked = false;
                }
                innerHTML.insert(checkbox);
                innerHTML.insert(new Element('label').update(this.text));
            } else {
                innerHTML = new Element('a').update(this.text);
            }
            this.innerHTML = innerHTML;
        }
        nodeItem.insert(this.innerHTML);
        nodeItem.observe('click', this.click.bind(this));
        nodeItem.observe('mouseover', this.mouseOver.bind(this));
        nodeItem.observe('mouseout', this.mouseOut.bind(this));

        if (options.interactive) {
            var expander = new Element('span');
            expander.observe('click', this.toggle.bind(this)),
            container.insert(expander);
        }
        this.element = nodeItem;
        container.insert(nodeItem);

        return container;
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