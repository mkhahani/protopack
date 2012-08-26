/**
 * Window Component based on Prototype
 */

if (typeof Prototype == 'undefined' || !Prototype.Version.match('1.7')) {
    throw('tWindow component requires Prototype library >= 1.7.0');
}

/**
 * Default configuration
 */
var tWindowOptions = {
    className       : 'twindow',
    showHeader      : true,
    closeButton     : true,
    escape          : true,
    draggable       : true,
    modal           : true,
    transparentDrag : true
}

/**
 * tWindow class
 */
var tWindow = Class.create({
    version: '1.0',

    /**
     * The window intializer
     */
    initialize: function(options, target) {
        this.options = tWindowOptions;
        Object.extend(this.options, options || {});
        this.className = this.options.className;

        this._window = this._createWindow();
        if (this.options.modal) {
            this._overlay = this._createOverlay();
        }
        if (this.options.showHeader) {
            this._header = this._createHeader();
        }
        this._body = this._createBody();
        if (this.options.closeButton) {
            this._createClose();
        }

        if (typeof target != 'undefined') {
            $(target).insert(this._window);
        } else {
            document.body.insert(this._window);
        }

        if (this.options.draggable) {
            if (typeof Draggable != 'undefined') {
                new Draggable(this._window);
            } else if (typeof tDraggable != 'undefined') {
                new tDraggable(this._window, 
                               this._header? this._header : this._window, 
                               {transparent:this.options.transparentDrag});
            }
        }
    },

    _createWindow: function() {
        var window  = new Element('div', {'class': this.className}).hide();
        window.setStyle({left:this.left + 'px', top:this.top + 'px'});
        if (this.options.escape) {
            document.observe('keydown', function(e) {
                if (window.visible() && e.keyCode == Event.KEY_ESC) {
                    this.close();
                }
            }.bind(this));
        }
        return window;
    },

    _createOverlay: function() {
        var overlay = new Element('div', {'class': this.className + '-overlay'});
        overlay.setOpacity(0.7);
        overlay.observe('mousedown', function(e) {Event.stop(e);});
        document.body.insert(overlay.hide());
        return overlay;
    },

    _createHeader: function() {
        var header = new Element('div', {'class': this.className + '-header'}),
            title = new Element('div', {'class': this.className + '-title'});
        this._title = title;
        this._window.insert(header);

        return header.insert(title);
    },

    _createBody: function() {
        var body = new Element('div', {'class': this.className + '-body'}),
            content = new Element('div', {'class': this.className + '-content'});
        this._content = content;
        this._window.insert(body);

        return body.insert(content);
    },

    _createClose: function() {
        var btnClose = new Element('span', {'class': this.className + '-close'});
        btnClose.observe('click', this.close.bind(this));
        this._window.insert(btnClose);
    },

    _setPosition: function(x, y) {
        if (typeof x != 'undefined' && typeof y != 'undefined') {
            try {
                this._window.style.left = x + 'px';
                this._window.style.top  = y + 'px';
            } catch(err) {
                throw 'Could not set window position.';
            }
        } else {
            //var docDim = document.viewport.getDimensions(),
            var dim = this._window.parentNode.getDimensions(),
                width  = this._window.getWidth(),
                height = this._window.getHeight();
            this._window.style.left = (width > dim.width)? 0 : Math.round(dim.width / 2 - width / 2) + 'px';
            this._window.style.top = (height > dim.height)? 0 :  Math.round(dim.height / 2 - height / 2) + 'px';
        }
    },

    setID: function(id) {
        this._window.id = id;
    },

    setTitle: function(title) {
        if (this._title) {
            this._title.update(title);
        }
    },

    setContent: function(content) {
        this._content.update(content);
    },

    setSize: function(width, height) {
        this._window.style.width = width + 'px';
        this._window.style.height = height + 'px';
    },

    show: function(x, y) {
        this._setPosition(x, y);
        this._window.show();
        if (this._overlay) {
            this._overlay.show();
        }
    },

    close: function() {
        this._window.hide();
        if (this._overlay) {
            this._overlay.hide();
        }
        if (this.onClose) {
            this.onClose();
        }
    }

});

