/**
 *  Protopack Input is a DHTML Input Component based on Prototype JS framework
 *  Copyright 2011-2013 Mohsen Khahani
 *  Licensed under the MIT license
 *  Created on September 17, 2011
 *
 *  Dependencies:
 *    - Prototype JS framework v1.7+
 *    - protopack.js
 *    - window.js
 *
 *  Features:
 *    - replacement for standard input
 *    - full CSS customizable
 *
 *  v1.1 (June 3, 2013):
 *    - using ProtopackWindow as dropdown
 *
 *  http://mohsenkhahani.ir/protopack
 */


/**
 * Default configuration
 */
var ProtopackInputOptions = {
    className : 'pinput-list',
    readonly : true,
    buttonStyle : 'smart',  // [disabled, visible, smart]
    dropdownStyle : 'auto'  // [disabled, manually, auto]
};

/**
 * ProtopackInput class
 */
var ProtopackInput = Class.create({
    Version: '1.1',

    initialize: function (target, options) {
        this.options = Object.clone(ProtopackInputOptions);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.readonly = this.options.readonly;
        this.buttonStyle = this.options.buttonStyle;
        this.dropdownStyle = this.options.dropdownStyle;
        this.xhtml = this._construct(target);
    },

    _construct: function (target) {
        var xhtml = new Element('div', {'class': this.className});

        this.entry = this._buildEntry();
        xhtml.insert(this.entry);

        if (this.buttonStyle !== 'disabled') {
            this.button = this._buildButton(xhtml);
            xhtml.insert(this.button);
        }

        if (this.dropdownStyle !== 'disabled') {
            this.dropdown = this._buildDropdown(xhtml);
        }

        if (target) {
            try {
                $(target).insert(xhtml);
                this.render();
            } catch (err) {
                throw new Error('The target element was not found.');
            }
        }

        return xhtml;
    },

    _buildEntry: function () {
        var entry = new Element('input', {type: 'text'});
        if (this.readonly) {
            entry.writeAttribute({readonly: true});
        }
        if (this.buttonStyle === 'smart') {
            entry.observe('mousedown', function () { this.button.hide(); }.bind(this));
        }
        entry.observe('mousedown', this._onInputClick.bind(this));

        return entry;
    },

    _buildButton: function (xhtml) {
        var button = new Element('button');
        if (this.buttonStyle === 'smart') {
            button.hide();
            xhtml.observe('mouseover', function () { button.show(); }.bind(this));
            xhtml.observe('mouseout', function () { button.hide(); }.bind(this));
        }
        button.observe('click', this._onButtonClick.bind(this));

        return button;
    },

    _buildDropdown: function (xhtml) {
        var options = {
                className: this.className + '-dropdown',
                modal: false,
                draggable: false,
                showHeader: false,
                closeButton: false,
                autoClose: true
            },
            dropdown = new ProtopackWindow(options, xhtml);
        dropdown.excludedElements.push(this.entry);
        return dropdown;
    },

    _onInputClick: function (e) {
        if (this.dropdownStyle === 'auto' && Event.isLeftClick(e)) {
            this.dropdown.toggle();
            //Event.stop(e); // To not be editable
        }
    },

    _onButtonClick: function (e) {
        if (this.dropdownStyle === 'auto') {
            this.dropdown.toggle();
            //Event.stop(e);
        }
    },

    get: function () {
        return this.xhtml;
    },

    render: function () {
        if (Element.getLayout()) {  // Prototype 7+
            if (this.dropdown.window.getWidth() < this.entry.getWidth()) {
                this.dropdown.window.setWidthTo(this.entry);
            }
            this.dropdown.window.style.top = this.entry.getHeight() + 'px';

            if (this.buttonStyle !== 'disabled') {
                var layout = new Element.Layout(this.entry);
                this.button.setHeightTo(this.entry);
                this.button.style.marginTop = layout.get('margin-top') + 'px';
                this.button.style.marginBottom = layout.get('margin-bottom') + 'px';
                this.button.style.paddingTop = layout.get('padding-top') + 'px';
                this.button.style.paddingBottom = layout.get('padding-bottom') + 'px';
            }
        }
    },

    openUp: function () {
        this.dropdown.open();
    }
});
