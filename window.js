/**
 * Protopack Window, a DHTML Window Component based on Prototype JS framework
 * © 2012 Mohsen Khahani
 *
 * Licensed under the MIT license
 * Created on May 6, 2012
 *
 * http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackWindowOptions = {
    className       : 'pwindow',
    modal           : true,
    draggable       : true,
    transparentDrag : true,
    escape          : true,
    showHeader      : true,
    closeButton     : true
};

/**
 * ProtopackWindow class
 */
var ProtopackWindow = Class.create({
    Version: '1.0',

    /**
     * The window intializer
     */
    initialize: function(options, target) {
        this.options = ProtopackWindowOptions;
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        target = (target === undefined)? document.body : $(target);

        if (this.window) {
            this.destroy();
        }
        this.window = this._construct(target);
    },

    /**
     * The window constructor
     *
     * @param   string  target  ID of the target element
     * @return  string  XHTML grid
     */
    _construct: function (target) {
        var window = this._createWindow();

        if (this.options.modal) {
            this._overlay = this._createOverlay(target);
        }

        if (this.options.showHeader) {
            this._header = this._createHeader();
            window.insert(this._header);
        }

        this._body = this._createBody();
        window.insert(this._body);

        if (this.options.closeButton) {
            window.insert(this._createClose());
        }

        target.insert(window);

        if (this.options.draggable) {
            if (typeof ProtopackDraggable !== 'undefined') {
                new ProtopackDraggable(window,
                                       this._header? this._header : window, 
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

    _createWindow: function() {
        var window  = new Element('div', {'class': this.className}).hide();
        if (this.options.escape) {
            document.observe('keydown', function(e) {
                if (window.visible() && e.keyCode == Event.KEY_ESC) {
                    this.close();
                }
            }.bind(this));
        }
        return window;
    },

    _createOverlay: function(target) {
        var overlay = new Element('div', {'class': this.className + '-overlay'});
        overlay.observe('mousedown', function(e) {Event.stop(e);});
        target.insert(overlay.hide());
        return overlay;
    },

    _createHeader: function() {
        var header = new Element('div', {'class': this.className + '-header'}),
            title = new Element('div', {'class': this.className + '-title'});
        this._title = title;

        return header.insert(title);
    },

    _createBody: function() {
        var body = new Element('div', {'class': this.className + '-body'}),
            content = new Element('div', {'class': this.className + '-content'});
        this._content = content;

        return body.insert(content);
    },

    _createClose: function() {
        var btnClose = new Element('span', {'class': this.className + '-close'});
        btnClose.observe('click', this.close.bind(this));

        return btnClose;
    },

    _setPosition: function(x, y) {
        if (x !== undefined && y !== undefined) {
            try {
                this.window.style.left = x + 'px';
                this.window.style.top  = y + 'px';
            } catch(err) {
                throw 'Could not set window position.';
            }
        } else {
            var dim = (this.window.parentNode === document.body)?
                    document.viewport.getDimensions() :
                    this.window.parentNode.getDimensions(),
                width  = this.window.getWidth(),
                height = this.window.getHeight();
            this.window.style.left = (width > dim.width)? 0 : Math.round(dim.width / 2 - width / 2) + 'px';
            this.window.style.top = (height > dim.height)? 0 : Math.round(dim.height / 2 - height / 2) + 'px';
        }
    },

    setId: function(id) {
        this.window.id = id;
    },

    setTitle: function(title) {
        if (this._title) {
            this._title.update(title);
        }
    },

    setContent: function(content) {
        this._content.update(content);
    },

    resize: function(width, height) {
        this.window.style.width = width + 'px';
        this.window.style.height = height + 'px';
    },

    show: function(x, y) {
        this._setPosition(x, y);
        this.window.show();
        if (this.options.modal) {
            this._overlay.show();
        }
    },

    close: function() {
        this.window.hide();
        if (this._overlay) {
            this._overlay.hide();
        }
        if (this.onClose) {
            this.onClose();
        }
    },

    destroy: function() {
        this.window.remove();
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
        }
    }

});

