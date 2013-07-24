/**
 * Protopack is set of DHTML UI Components based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2011-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @url         http://mohsenkhahani.ir/protopack
 */


/**
 * Checks for existance of Prototype JS
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
var Protopack = Protopack || {
    version: '1.0',

    /**
     * Adds `observe` and `fire` methods to passed object
     * Thanks to Ryan Johnson for his LivePipe's Event extension
     */
    extendEvents: function (object) {
        Object.extend(object, {
            initObserve: function (event) {
                this.observers = this.observers || {};
                this.observers[event] = this.observers[event] || [];
            },
            observe: function (event, handler) {
                this.initObserve(event);
                if (!this.observers[event].include(handler)) {
                    this.observers[event].push(handler)
                }
            },
            fire: function (event) {
                this.initObserve(event);
                if (this.observers[event] !== undefined) {
                    for (var i = 0; i < this.observers[event].length; i++) {
                        var args = $A(arguments).slice(1);
                        this.observers[event][i].apply(this, args);
                    }
                }
            }
        });
    }
};

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
