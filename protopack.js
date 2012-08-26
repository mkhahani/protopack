/**
 * Checks for existance of the Prototype JS
 */
if (typeof Prototype === 'undefined' || !Prototype.Version.match('1.7')) {
    throw('Protopack requires the Prototype JavaScript framework 1.7.0+');
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
