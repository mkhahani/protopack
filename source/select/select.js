/**
 * Protopack Select is a DHTML replacement for standard SELECT, based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.1
 * @created     June 3, 2013
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - Protopack Input
 */


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
