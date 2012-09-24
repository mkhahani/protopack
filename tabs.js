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
    className  : 'ptabs',
    findTabs   : true,
    hover      : false,
    defaultTab : 1
}

/**
 * ProtopackInput base class
 */
var ProtopackTabs = Class.create({
    Version: '1.2',

    /**
     * The tabs intializer
     * @param   string  target  ID of the target element
     * @param   object  options
     */
    initialize: function (target, options) {
        if (!$(target)) {
            throw new Error('ProtopackTabs.initialize(): Could not find the target element "' + target + '".');
        }
        this._target = $(target);
        this.options = Object.clone(ProtopackTabsOptions);
        Object.extend(this.options, options || {});
        if (this.options.findTabs) {this._construct();}
    },

    /**
     * Builds tabs
     * @param   string  target  ID of the target element
     */
    _construct: function () {
        var links = this._target.select('li a');
        this.tabs = this._target.select('li').invoke('addClassName', this.options.className + '-tab');
        this.sheets = links.map(function (link) {return $(link.rel);});
        links.invoke('observe', 'click', this._switchTab.bind(this));
        if (this.options.hover) {
            links.invoke('observe', 'mouseover', this._switchTab.bind(this));
        }
        this._reset();
        this.setActive(this.options.defaultTab);
        this._target.addClassName(this.options.className);
    },

    /**
     * Creates tabs by passed tabs data
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    _createTabs: function (tabs) {
        var ul = new Element('ul').addClassName(this.options.className);
        this.sheets = tabs.map(function (tab) {return $(tab[0]);});
        this.tabs = tabs.map(function (tab) {
            var a = new Element('a', {rel:tab[0]}).update(tab[1]),
                li = new Element('li').insert(a);
            a.observe('click', this._switchTab.bind(this));
            if (this.options.hover) {
                a.observe('mouseover', this._switchTab.bind(this));
            }
            li.addClassName(this.options.className + '-tab');
            ul.insert(li);
            return li;
        }.bind(this));
        return ul;
    },

    /**
     * Switches to the clicked/hovered tab
     * @param   object  e   mouse event (click or mouseover)
     */
    _switchTab: function (e) {
        var link = Event.findElement(e);
        this._reset();
        $(link.rel).show();
        link.up('li').addClassName('active');
    },

    /**
     * Deselects tabs and hides all sheets
     */
    _reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClassName', 'active');
    },

    /**
     * Creates tabs by passed tabs data
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    setTabs: function (tabs) {
        this._target.insert({top: this._createTabs(tabs)});
        this._reset();
        this.setActive(this.options.defaultTab);
    },

    /**
     * Selects a tab and displays related sheet
     * @param   integer index   tab index, begins from 1
     */
    setActive: function (index) {
        this._reset();
        this.tabs[index - 1].addClassName('active');
        this.sheets[index - 1].show();
    }
});
