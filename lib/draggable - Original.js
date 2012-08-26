var dragObj;
var cursorStartX;
var cursorStartY;
var elementStartX;
var elementStartY;
var dragGofn;
var dragStopfn;

function startDrag(event) { 
    //dragObj = Event.element(event);
    // if the target of the event is not a "draggable" element, then search
    // through it's parents for an element that is draggable.
    // if we can't find a draggable element before reaching the root document
    // element, then bail out
    // while (!Element.hasClassName(dragObj,"draggable")) {
         // dragObj = $(dragObj).up('.draggable');
    // }
    cursorStartX = Event.pointerX(event);
    cursorStartY = Event.pointerY(event);
    elementStartX = parseInt(dragObj.style.left, 10);
    elementStartY = parseInt(dragObj.style.top, 10);
    
    Event.observe(window, 'mousemove', dragGofn);
    Event.observe(window, 'mouseup', dragStopfn);
}

function dragGo(event) { 

    var x, y;
    x = Event.pointerX(event);
    y = Event.pointerY(event);

    // move the target object
    dragObj.style.left = (x - cursorStartX + elementStartX) + "px";
    dragObj.style.top = (y - cursorStartY + elementStartY) + "px";
    
    Event.stop(event);
}

function dragStop(event) {
    // Stop capturing mousemove and mouseup events.
    Event.stopObserving(window, 'mousemove', dragGofn);
    Event.stopObserving(window, 'mouseup', dragStopfn);
    //dragObj = null;

    Event.stop(event);
}

function makeDragable(draggableElem) {
    dragObj = draggableElem;
    dragGofn = dragGo.bindAsEventListener();
    dragStopfn = dragStop.bindAsEventListener();

    Event.observe(draggableElem, 'mousedown', startDrag.bindAsEventListener());
    // $$(".draggable").each(function(draggableElem) {
        // Event.observe(draggableElem, 'mousedown', startDrag.bindAsEventListener());
    // });
    
}
