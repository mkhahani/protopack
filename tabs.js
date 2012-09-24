/**
 * Protopack Tabs is a DHTML Tabs Component based on Prototype JS framework
 * © 2012 Mohsen Khahani
 *
 * Licensed under the MIT license
 * Created on August 4, 2012
 *
 * http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackTabsOptions = {
    defaultTab: 1,
    hover     : false
}

/**
 * ProtopackInput base class
 */
var ProtopackTabs = Class.create({
    Version: '1.1',

    /**
     * The tabs intializer
     * @param   string  target  ID of the target element
     * @param   object  options
     */
    initialize: function (target, options) {
        if (!$(target)) {
            throw new Error('ProtopackTabs.initialize(): Could not find the target element "' + target + '".');
        }
        this.options = Object.clone(ProtopackTabsOptions);
        Object.extend(this.options, options || {});
        this._construct(target);
    },

    /**
     * Builds tabs
     * @param   string  target  ID of the target element
     */
    _construct: function (target) {
        var links = $(target).select('li a');
        this.tabs = $(target).select('li');
        this.sheets = links.map(function (link) {return $(link.rel);});
        links.invoke('observe', 'click', this._switchTab.bind(this));
        if (this.options.hover) {
            links.invoke('observe', 'mouseover', this._switchTab.bind(this));
        }

        this._reset();
        this.setActive(this.options.defaultTab);
    },

    /**
     * Switches to the clicked/hovered tab
     * @param   object  e   mouse event (click or mouseover)
     */
    _switchTab: function (e) {
        var link = Event.findElement(e);
        this._reset();
        $(link.rel).show();
        link.up('li').className = 'active';
    },

    /**
     * Deselects tabs and hides all sheets
     */
    _reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClassName', 'active');
    },

    /**
     * Selects a tab and displays related sheet
     * @param   integer index   tab index, begins from 1
     */
    setActive: function (index) {
        this._reset();
        this.tabs[index - 1].className = 'active';
        this.sheets[index - 1].show();
    }
});
