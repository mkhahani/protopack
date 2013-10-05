/**
 * Protopack Tabs is a DHTML Tabs Component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2012-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.2
 * @created     August 4, 2012
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tabs base class
 */
Protopack.Tabs = Class.create({

    /**
     * Default configuration
     */
    options: {
        className: 'ptabs',
        findTabs: true,
        hover: false,
        defaultTab: 1
    },

    /**
     * Tabs intializer
     *
     * @access  private
     * @param   mixed   target  Container element/ID
     * @param   object  options
     * @return  Clss instance of Tabs
     */
    initialize: function (target, options) {
        if (!$(target)) {
            throw new Error('Protopack.Tabs.initialize(): Could not find the target element "' + target + '".');
        }
        this.target = $(target);
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        Protopack.extendEvents(this);
        if (this.options.findTabs) { this.construct(); }
    },

    /**
     * Builds tabs
     *
     * @access  private
     * @return  void
     */
    construct: function () {
        var links = this.target.select('li a');
        this.tabs = this.target.select('li').invoke('addClassName', this.options.className + '-tab');
        this.sheets = links.map(function (link) {return $(link.rel);});
        links.invoke('observe', 'click', this.switchTab.bind(this));
        if (this.options.hover) {
            links.invoke('observe', 'mouseover', this.switchTab.bind(this));
        }
        this.reset();
        this.setActive(this.options.defaultTab);
        this.target.addClassName(this.options.className);
    },

    /**
     * Creates tabs by passed tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    createTabs: function (tabs) {
        var ul = new Element('ul').addClassName(this.options.className);
        this.sheets = tabs.map(function (tab) {return $(tab[0]);});
        this.tabs = tabs.map(function (tab) {
            var a = new Element('a', {rel:tab[0]}).update(tab[1]),
                li = new Element('li').insert(a);
            a.observe('click', this.switchTab.bind(this));
            if (this.options.hover) {
                a.observe('mouseover', this.switchTab.bind(this));
            }
            li.addClassName(this.options.className + '-tab');
            ul.insert(li);
            return li;
        }.bind(this));
        return ul;
    },

    /**
     * Switches to the clicked/hovered tab
     *
     * @param   object  e   mouse event (click or mouseover)
     */
    switchTab: function (e) {
        var link = Event.findElement(e);
        this.reset();
        $(link.rel).show();
        link.up('li').addClassName('active');
        this.fire('tabs:change', link.rel);
    },

    /**
     * Deselects tabs and hides all sheets
     */
    reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClassName', 'active');
    },

    /**
     * Creates tabs by passing tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    setTabs: function (tabs) {
        this.target.insert({top: this.createTabs(tabs)});
        this.reset();
        this.setActive(this.options.defaultTab);
    },

    /**
     * Selects a tab and displays related sheet
     *
     * @param   integer index   tab index, begins from 1
     */
    setActive: function (index) {
        this.reset();
        this.tabs[index - 1].addClassName('active');
        this.sheets[index - 1].show();
        this.fire('tabs:change', this.tabs[index - 1].down('a').rel);
    }
});
