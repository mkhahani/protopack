/**
 * Protopack Progressbar is a DHTML progressbar component based on Prototype JS framework
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2012-2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     Aug 24, 2012
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Progressbar base class
 */
Protopack.Progressbar = Class.create({

    /**
     * Default configuration
     */
    options: {
        className    : 'pprogressbar',
        start        : 0,
        end          : 10,
        position     : 0,
        step         : 1,
        valueType    : 'ratio',     // [none, number, ratio, percent]
        valuePos     : 'right',     // [center, left, right, float]
        valuePostfix : '',          // Bytes, Seconds, ...
        direction    : 'horizontal' // Not emplemented yet
    },

    /**
     * Progressbar intializer
     */
    initialize: function(target, options) {
        this.options = Object.clone(this.options);
        Object.extend(this.options, options || {});
        this.className = this.options.className;
        this.start     = this.options.start;
        this.end       = this.options.end;
        this.position  = this.options.position;
        this.step      = this.options.step;
        this._constructor(target);
    },

    /**
     * Creates the progressbar structure
     */
    _constructor: function(target) {
        var progress  = new Element('div', {'class':'bar'}).update('&nbsp;'),
            container = new Element('div', {'class':this.className});
        container.insert(progress);
        this.container = container;
        this.progressBar = progress;
        $(target).update(container);
        if (this.options.valueType != 'none') {
            this.valueBar = this._createValuebar();
        }

        this._init();
        this._update();
    },

    _createValuebar: function() {
        var valueBar = new Element('div', {'class':'value'});
        this.container.insert(valueBar);
        return valueBar;
    },

    _init: function() {
        this.valueBar.style.lineHeight = this.progressBar.measure('height') + 'px';
        this.width = this.container.measure('width');
        this._pxStep = this.width / (this.end - this.start);
        switch (this.options.valuePos) {
            case 'center':
                this.valueBar.style.left = '0';
                this.valueBar.style.width = '100%';
                break;
            case 'left':
                this.valueBar.style.left = -this.valueBar.getWidth() + 'px';
                break;
            case 'right':
                this.valueBar.style.left = this.container.getWidth() + 'px';
                break;
        }
    },

    _update: function() {
        //var width;
        this._pxPos = (this.position - this.start) * this._pxStep;
        // if (this.position == this.end) {
            // width = this.width;
        // } else if (this.position == this.start) {
            // width = 0;
        // } else {
            // width = Math.round(this._pxPos);
        // }
        //width = Math.round(this._pxPos);
        this.progressBar.style.width = Math.round(this._pxPos) + 'px';
        if (this.valueBar) {
            this._updateValueBar();
        }
    },

    _updateValueBar: function() {
        var value;
        switch (this.options.valueType) {
            case 'ratio':
                value = this.position + '/' + this.end;
                break;
            case 'percent':
                value = Math.round(this.position * 100 / (this.end - this.start));
                break;
            case 'number':
            default:
                value = this.position;
                break;
        }
        this.valueBar.update(value + ' ' + this.options.valuePostfix);
        if (this.options.valuePos === 'float') {
            //this.valueBar.style.left = this.progressBar.getWidth() - Math.round(this.valueBar.getWidth() / 2) + 'px';
            this.valueBar.style.left = Math.round(this.progressBar.getWidth() / 2) - Math.round(this.valueBar.getWidth() / 2) + 'px';
        }
    },

    setID: function(id) {
        this.container.id = id;
    },

    reset: function() {
        this.position = this.start;
        this.progressBar.style.width = '0';
        if (this.valueBar) {
            this._updateValueBar();
        }
    },

    setStart: function(start) {
        this.start = start;
        this._init();
    },

    setEnd: function(end) {
        this.end = end;
        this._init();
    },

    setPosition: function(pos) {
        this.position = pos;
        this._update();
    },

    stepIt: function() {
        if (this.position < this.end) {
            this.position++;
            this._update();
        }
    },

    stepBy: function(steps) {
        var newPos = this.position + steps;
        if (newPos > this.end) {
            this.position = this.end;
        } else if (newPos < this.start) {
            this.position = this.start;
        } else {
            this.position = newPos;
        }
        this._update();
    }
});
