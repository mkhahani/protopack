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
