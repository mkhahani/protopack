/**
 * Protopack Context Menu is a DHTML Context Menu Component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     May 14, 2013
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 *    - Protopack Window
 */


/**
 * Default configuration
 */
var ProtopackContextMenuOptions = {
    className       : 'pwindow'
};

/**
 * Protopack ContextMenu base class
 */
Protopack.ContextMenu = Class.create(Protopack.Window, {
    Version: '1.0',

    /**
     * The menu intializer
     */
    initialize: function(options, target) {
        this.options = ProtopackContextMenuOptions;
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.options.modal = false;
        this.options.draggable = false;
        this.options.showHeader = false;
        this.options.closeButton = false;
        target = (target === undefined)? document.body : $(target);

        if (this.window) {
            this.destroy();
        }
        this.window = this._construct(document.body);
    },

    /**
     * The menu constructor
     *
     * @param   string  target  ID of the target element
     * @return  string  XHTML grid
     */
    _construct: function ($super, target) {
        var window = $super(target);   // Calling constructor of the Parent Class
        this.setContent(new Element('ul'));
        return window;
    },

    addItem: function(item) {
        var li = new Element('li').update(item);
        this._content.down('ul').insert(li);
        return li;
    },

    setItems: function(items) {
        items.each(function(item) {
            this.addItem(item);
        }, this);
    },

    bindTo: function(target, selector) {
        if (Object.isArray(target)) {
            for (var i = 0; i < target.length; i++) {
                target[i].on('contextmenu', selector, this.onContextMenu.bind(this));
            }
        } else {
            target.on('contextmenu', selector, this.onContextMenu.bind(this));
        }
    },

    onContextMenu: function(e) {
        var pos = e.pointer();
        this.show(pos.x, pos.y);
        e.stop();
        //console.log(e.pointerX());
    }

});

