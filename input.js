/**
 *  Protopack Input, a DHTML Input Component based on Prototype JS framework
 *  © 2011-2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on September 17, 2011
 *
 *  http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackInputOptions = {
    className   : 'pp-input',
    readonly    : true,
    buttonStyle : 'smart',  // [disabled, visible, smart]
    popupStyle  : 'auto'    // [disabled, manually, auto]
}

/**
 * ProtopackInput base class
 */
var ProtopackInput = Class.create({
    Version: '1.0',

    initialize: function (target, options) {
        this.options     = Object.clone(ProtopackInputOptions);
        Object.extend(this.options, options || {});
        this.className   = this.options.className;
        this.readonly    = this.options.readonly;
        this.buttonStyle = this.options.buttonStyle;
        this.popupStyle  = this.options.popupStyle;
        this.xhtml       = this._construct();
        if (target) {
            try {
                $(target).insert(this.xhtml);
                this.render();
            } catch (err) {
                throw new Error('The target element was not found.');
            }
        }
    },

    _construct: function () {
        var xhtml  = new Element('div', {'class': this.className});
        this.entry = this._buildEntry();
        xhtml.insert(this.entry);
        if (this.buttonStyle !== 'disabled') {
            this.button = this._buildButton(xhtml);
            xhtml.insert(this.button);
        }
        if (this.popupStyle !== 'disabled') {
            this.popup = this._buildPopup();
            xhtml.insert(this.popup);
        }
        return xhtml;
    },

    _buildEntry: function () {
        var entry = new Element('input', {type: 'text'});
        if (this.readonly) {
            entry.writeAttribute({readonly: true});
        }
        if (this.buttonStyle === 'smart') {
            entry.observe('mousedown', function () {this.button.hide()}.bind(this));
        }
        entry.observe('mousedown', this._onInputClick.bind(this));

        return entry;
    },

    _buildButton: function (xhtml) {
        var button = new Element('button');
        if (this.buttonStyle === 'smart') {
            button.hide();
            xhtml.observe('mouseover', function () {button.show()}.bind(this));
            xhtml.observe('mouseout', function () {button.hide()}.bind(this));
        }
        button.observe('click', this._onButtonClick.bind(this));

        return button;
    },

    _buildPopup: function () {
        var popup = new Element('div', {'class': this.className + '-popup'}).hide();
        popup.observe('mouseover', function () {this.hasFocus = true}.bind(this));
        popup.observe('mouseout', function () {this.hasFocus = false}.bind(this));
        document.observe('click', this._onPopupLostFocus.bind(this));

        return popup;
    },

    _onInputClick: function (e) {
        if (this.popupStyle === 'auto' && Event.isLeftClick(e)) {
            this.popup.toggle();
            // Event.stop(e); // To not be editable
        }
    },

    _onButtonClick: function (e) {
        if (this.popupStyle === 'auto') {
            this.popup.toggle();
            //Event.stop(e);
        }
    },

    _onPopupLostFocus: function (e) {
        var el = Event.findElement(e);
        if (el !== this.entry && !this.hasFocus) {
            this.popup.hide();
        }
    },


//=============================================================================
// Public Functions
//=============================================================================
    get: function () {
        return this.xhtml;
    },

    render: function () {
        if (Element.getLayout()) {  // Prototype 7+
            if (this.popup.getWidth() < this.entry.getWidth()) {
                setEqualWidth(this.entry, this.popup);
            }
            this.popup.style.marginTop = -this.entry.measure('margin-bottom') + 'px';

            if (this.buttonStyle !== 'disabled') {
                var layout = new Element.Layout(this.entry);
                setEqualHeight(this.entry, this.button);
                this.button.style.marginTop = layout.get('margin-top') + 'px';
                this.button.style.marginBottom = layout.get('margin-bottom') + 'px';
                this.button.style.paddingTop = layout.get('padding-top') + 'px';
                this.button.style.paddingBottom = layout.get('padding-bottom') + 'px';
            }
        }
    },

    openPopup: function () {
        this.popup.show();
    }
});
