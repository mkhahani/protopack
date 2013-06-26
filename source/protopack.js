/**
 *  Protopack is set of DHTML UI Components based on Prototype JS framework
 *  Copyright 2011-2013 Mohsen Khahani
 *  Licensed under the MIT license
 *  http://mohsenkhahani.ir/protopack
 */


/**
 * Checks for existance of the Prototype JS
 */
if (typeof Prototype === 'undefined' || !Prototype.Version.match('1.7')) {
    throw('Protopack requires Prototype JavaScript framework 1.7.0+');
}

/**
 * Main Protopack namespace
 *
 * @type    object
 * @access  public
 */
var Protopack = Protopack || {};

/**
 * Defines Prototype.Browser.IE6 as boolean
 */
if (Object.isUndefined(Prototype.Browser.IE6)) {
	Prototype.Browser.IE6 = (navigator.appName.indexOf("Microsoft Internet Explorer") != -1 && 
                             navigator.appVersion.indexOf("MSIE 6.0") != -1 && 
                             !window.XMLHttpRequest);
}

Element.addMethods({  
    /**
     * Cross browser solution for innerText property
     */
    getInnerText: function (self) {
        self = $(self);
        return (self.innerText && !window.opera)? self.innerText :
            self.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
    },

    /**
     * Sets width of the element to width of the givven element
     */
    setWidthTo: function (self, element) {
        var layout = new Element.Layout(self),
            sourceWidth = element.getWidth(),
            padding = layout.get('padding-left') + layout.get('padding-right'),
            border  = layout.get('border-left')  + layout.get('border-right');
        self.setStyle({width: sourceWidth - padding - border + 'px'});
    },

    /**
     * Sets height of the element to height of the givven element
     */
    setHeightTo: function (self, element) {
        var layout = new Element.Layout(self),
            sourceHeight = element.getHeight(),
            padding = layout.get('padding-top') + layout.get('padding-bottom'),
            border  = layout.get('border-top')  + layout.get('border-bottom');
        self.setStyle({height: sourceHeight + 'px'});
    }
});

/**
 * Adds commas to a number string
 * From "http://www.mredkj.com/javascript/numberFormat.html" + some improvements
 */
function addCommas(nStr, symbol)
{
	var rgx = /(\d+)(\d{3})/,
        x, x1, x2, res;
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	res = x1 + x2;
    if (!res.blank() && symbol !== undefined) {
        res = symbol + res;
    }
    return res;
}
