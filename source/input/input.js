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
                autoClose: true
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
