/**
 *  Protopack Draggable is a drag & drop library based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2012-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     May 6, 2012
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Draggable base class
 */
Protopack.Draggable = Class.create({

    /**
     * Default configuration
     */
    options: {
        transparent: true
    },

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
        this.options = Object.clone(this.options);
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

