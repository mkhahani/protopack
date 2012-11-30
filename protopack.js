/**
 * Protopack is set of DHTML UI Components based on Prototype JS framework
 * © 2011-2012 Mohsen Khahani
 *
 * Licensed under the MIT license
 * http://mohsen.khahani.com/protopack
 */


/**
 * Checks for existance of the Prototype JS
 */
if (typeof Prototype === 'undefined' || !Prototype.Version.match('1.7')) {
    throw('Protopack requires Prototype JavaScript framework 1.7.0+');
}

/**
 * Defines Prototype.Browser.IE6 as boolean
 */
if (Object.isUndefined(Prototype.Browser.IE6)) {
	Prototype.Browser.IE6 = (navigator.appName.indexOf("Microsoft Internet Explorer") != -1 && 
                             navigator.appVersion.indexOf("MSIE 6.0") != -1 && 
                             !window.XMLHttpRequest);
}

/**
 * Adds innerText property to all Elements
 */
Element.addMethods({  
    getInnerText: function (element) {
        element = $(element);
        return (element.innerText && !window.opera)? element.innerText :
            element.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
    }
});

/**
 * Sets width of the target element same as the source element
 */
function setEqualWidth(sourceEl, targetEl) {
    var e1 = $(sourceEl),
        e2 = $(targetEl),
        layout = new Element.Layout(e2),
        sourceWidth = e1.getWidth(),
        padding = layout.get('padding-left') + layout.get('padding-right'),
        border  = layout.get('border-left')  + layout.get('border-right');
    e2.setStyle({width: sourceWidth - padding - border + 'px'});
}

/**
 * Sets height of the target element same as the source element
 */
function setEqualHeight(sourceEl, targetEl) {
    var e1 = $(sourceEl),
        e2 = $(targetEl),
        layout = new Element.Layout(e2),
        sourceHeight = e1.getHeight(),
        padding = layout.get('padding-top') + layout.get('padding-bottom'),
        border  = layout.get('border-top')  + layout.get('border-bottom');
    e2.setStyle({height: sourceHeight + 'px'});
}

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
