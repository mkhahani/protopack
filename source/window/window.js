/**
 *  Protopack Window is a DHTML Window Component based on Prototype JS framework
 *  Copyright 2012-2013 Mohsen Khahani
 *  Licensed under the MIT license
 *  Created on May 6, 2012
 *
 *  Dependencies:
 *    - Prototype JS Framework v1.7+
 *    - draggable.js (optional)
 *
 *  Features:
 *    - rich JavaScript popup window
 *    - draggable
 *    - modal support
 *    - full CSS customizable
 *    - mouse and keyboard events
 *    - many useful options
 *
 *  v1.1 (May 25, 2013):
 *    - added `autoClose` option
 *    - fixed `overlay` positioning
 *    - many enhancements
 *    - code comments
 *
 *  v1.2 (June 3, 2013):
 *    - changed `show()` to `open()`
 *    - added `toggle()` function
 *    - added `excludedElements` property
 *
 *  http://mohsenkhahani.ir/protopack
 */


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
        closeButton     : true
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
        this.focusHandler = this._onLostFocus.bind(this);
        this.escapeHandler = this._onEscape.bind(this);
        this.excludedElements = [];     // don't fire _onLostFocus() for these elements
        target = (target === undefined)? document.body : $(target);

        if (this.window) {
            this.destroy();
        }
        this.window = this._construct(target);
        this._setPosition();
    },

    /**
     * Window constructor
     *
     * @access  private
     * @param   string  target  ID of the target element
     * @return  string  XHTML window
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

    /**
     * Builds the main window
     *
     * @access  private
     * @return  object  Window element
     */
    _createWindow: function () {
        return new Element('div', {'class': this.className}).hide();
    },

    /**
     * Builds the screen overlay
     *
     * @access  private
     * @return  object  Overlay element
     */
    _createOverlay: function (target) {
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
    _createHeader: function () {
        var header = new Element('div', {'class': this.className + '-header'}),
            title = new Element('div', {'class': this.className + '-title'});
        this._title = title;

        return header.insert(title);
    },

    /**
     * Builds the body of the window
     *
     * @access  private
     * @return  object  Window body element
     */
    _createBody: function () {
        var body = new Element('div', {'class': this.className + '-body'}),
            content = new Element('div', {'class': this.className + '-content'});
        this._content = content;

        return body.insert(content);
    },

    /**
     * Builds the close button
     *
     * @access  private
     * @return  object  Close button element
     */
    _createClose: function () {
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
    _startDocEvents: function () {
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
    _stopDocEvents: function () {
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
    _onEscape: function (e) {
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
    _onLostFocus: function (e) {
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
    _setPosition: function (x, y) {
        if (x !== undefined && y !== undefined) {
            try {
                this.window.style.left = x + 'px';
                this.window.style.top  = y + 'px';
            } catch(err) {
                throw 'Could not set window position.';
            }
        } else {
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
        if (this._title) {
            this._title.update(title);
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
        this._content.update(content);
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
        if (x !== undefined && y !== undefined) {
            this._setPosition(x, y);
        }
        this.window.show();
        if (this.options.modal) {
            this._overlay.show();
        }
        this._startDocEvents();
    },

    /**
     * Hides the window
     *
     * @access  public
     * @return  void
     */
    close: function () {
        this._stopDocEvents();
        this.window.hide();
        if (this._overlay) {
            this._overlay.hide();
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
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
        }
    }
});
