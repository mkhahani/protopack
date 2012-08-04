/**
 *  Protopack Tabs, a DHTML Tabs Component based on Prototype JS framework
 *  © 2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on August 4, 2012
 *
 *  http://mohsen.khahani.com/protopack
 */


/**
 * Default configuration
 */
var ProtopackTabsOptions = {
    defaultTabIndex : 1
}

function TabsError(message) {
   this.name = 'ProtopackTabs Error';
   this.message = message;
}
TabsError.prototype = new Error();
//ProtopackTabssError.prototype.constructor = ProtopackTabssError;

/**
 * ProtopackInput base class
 */
var ProtopackTabs = Class.create({
    Version: '1.0',

    initialize: function (target, options) {
        if (!$(target)) {
            throw new TabsError('Could not find the target element "' + target + '".');
        }
        this.options = Object.clone(ProtopackTabsOptions);
        Object.extend(this.options, options || {});
        this.tabs = $(target).select('li');
        this.links = $(target).select('li a');
        this.sheets = this.links.map(function (link) {
            return $(link.rel);
        });
        this.links.each(function(link) {
            link.observe('click', this._onSelectTab.bind(this));
        }.bind(this));

        this._reset();
        this.setActive(this.options.defaultTabIndex);
    },

    _onSelectTab: function (e) {
        var link = Event.findElement(e);
        this._reset();
        $(link.rel).show();
        link.up('li').className = 'active';
    },

    _reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClassName', 'active');
    },

    setActive: function (index) {
        this._reset();
        this.tabs[index - 1].className = 'active';
        this.sheets[index - 1].show();
    }
});
