/**
 *  Protopack Draggable, a drag & drop library based on Prototype JS framework
 *  © 2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on May 6, 2012
 *
 *  http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackDraggableOptions = {
    transparent: true
};

/**
 * ProtopackDraggable class
 */
var ProtopackDraggable = Class.create({
    Version: '1.0',

    /**
     * The intializer
     */
    initialize: function(draggableEl, clickableEl, options) {
        if (draggableEl === undefined) {
            return;
        }
        if (clickableEl === undefined) {
            clickableEl = draggableEl;
        }
        this.options = ProtopackDraggableOptions;
        Object.extend(this.options, options || {});

        this.dragObj = draggableEl;
        this.clickObj = clickableEl;
        this.goDragFunc = this.goDrag.bindAsEventListener(this);
        this.stopDragFunc = this.stopDrag.bindAsEventListener(this);
        Event.observe(clickableEl, 'mousedown', this.startDrag.bindAsEventListener(this));
    },

    startDrag: function(e) {
        if (Event.isLeftClick(e)) {
            this.cursorOffset = [
                Event.pointerX(e) - this.dragObj.offsetLeft,
                Event.pointerY(e) - this.dragObj.offsetTop
            ]
            Event.observe(document, 'mousemove', this.goDragFunc);
            Event.observe(this.clickObj, 'mouseup', this.stopDragFunc);
            Event.stop(e);
            this.dragObj.absolutize();
            if (this.options.transparent) {
                this.dragObj.setOpacity(0.9);
            }
        }
    },

    stopDrag: function(e) {
        Event.stopObserving(document, 'mousemove', this.goDragFunc);
        Event.stopObserving(this.clickObj, 'mouseup', this.stopDragFunc);
        //Event.stop(e);
        this.dragObj.relativize();
        if (this.options.transparent) {
            this.dragObj.setOpacity(1);
        }
    },

    goDrag: function(e) {
        var x = Event.pointerX(e),
            y = Event.pointerY(e);
        this.dragObj.style.left = x - this.cursorOffset[0] + 'px';
        this.dragObj.style.top  = y - this.cursorOffset[1] + 'px';
        Event.stop(e);
    }

});

