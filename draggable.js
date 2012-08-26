/**
 * Drag & Drop library based on Prototype
 */

if (typeof Prototype == 'undefined' || !Prototype.Version.match('1.7')) {
    throw('tDraggable component requires Prototype library >= 1.7.0');
}

/**
 * Default configuration
 */
var tDraggableOptions = {
    transparent: true
}

/**
 * tDraggable class
 */
var tDraggable = Class.create({
    version: '1.0',

    /**
     * The intializer
     */
    initialize: function(draggableEl, clickableEl, options) {
        if (typeof draggableEl == 'undefined') {
            return;
        }
        if (typeof clickableEl == 'undefined') {
            clickableEl = dragableEl;
        }
        this.options = tDraggableOptions;
        Object.extend(this.options, options || {});

        this.dragObj = draggableEl;
        this.clickObj = clickableEl;
        this.goDragFunc = this.goDrag.bindAsEventListener(this);
        this.stopDragFunc = this.stopDrag.bindAsEventListener(this);
        Event.observe(clickableEl, 'mousedown', this.startDrag.bindAsEventListener(this));
    },

    startDrag: function(event) {
        if (Event.isLeftClick(event)) {
            this.cursorOffsetX = Event.pointerX(event) - this.dragObj.offsetLeft;
            this.cursorOffsetY = Event.pointerY(event) - this.dragObj.offsetTop;
            Event.observe(window, 'mousemove', this.goDragFunc);
            Event.observe(window, 'mouseup', this.stopDragFunc);
            Event.stop(event);
            if (this.options.transparent) {
                this.dragObj.setOpacity(0.9);
            }
        }
    },

    stopDrag: function(event) {
        Event.stopObserving(window, 'mousemove', this.goDragFunc);
        Event.stopObserving(window, 'mouseup', this.stopDragFunc);
        //Event.stop(event);
        if (this.options.transparent) {
            this.dragObj.setOpacity(1);
        }
    },

    goDrag: function(event) {
        var x = Event.pointerX(event),
            y = Event.pointerY(event);
        this.dragObj.style.left = x - this.cursorOffsetX + 'px';
        this.dragObj.style.top  = y - this.cursorOffsetY + 'px';
        //Event.stop(event);
    }

});

