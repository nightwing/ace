/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function (require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var dom = require("ace/lib/dom");
var event = require("ace/lib/event");
var EventEmitter = require("ace/lib/event_emitter").EventEmitter;

dom.importCssString(
    '.ace_editor>.ace_sb-v div, .ace_editor>.ace_sb-h div{\n' +
    '  position: absolute;\n' +
    '  background: rgba(128, 128, 128, 0.6);\n' +
    '  -moz-box-sizing: border-box;\n' +
    '  box-sizing: border-box;\n' +
    '  border: 1px solid #bbb;\n' +
    '  border-radius: 2px;\n' +
    '  z-index: 8;\n' +
    '}\n' +
    '.ace_editor>.ace_sb-v, .ace_editor>.ace_sb-h {\n' +
    '  position: absolute;\n' +
    '  z-index: 6;\n' +
    '  background: rgba(200, 200, 200, 0.3);\n' +
    '  overflow: hidden!important;\n' +
    '}\n' +
    '.ace_editor>.ace_sb-v {\n' +
    '  z-index: 6;\n' +
    '  right: 0;\n' +
    '  top: 0;\n' +
    '  width: 12px;\n' +
    '}' +
    '.ace_editor>.ace_sb-v div {\n' +
    '  z-index: 8;\n' +
    '  right: 0;\n' +
    '  width: 100%;\n' +
    '}' +
    '.ace_editor>.ace_sb-h {\n' +
    '  bottom: 0;\n' +
    '  left: 0;\n' +
    '  height: 12px;\n' +
    '}' +
    '.ace_editor>.ace_sb-h div {\n' +
    '  bottom: 0;\n' +
    '  height: 100%;\n' +
    '}' +
    '.ace_editor>.ace_sb_grabbed {\n' +
    '  z-index: 8;\n' +
    '  background: #000;\n' +
    '}'
);

/**
 * An abstract class representing a native scrollbar control.
 * @class ScrollBar
 **/

/**
 * Creates a new `ScrollBar`. `parent` is the owner of the scroll bar.
 * @param {DOMElement} parent A DOM element
 *
 * @constructor
 **/

var ScrollBar = function (parent) {
    this.element = dom.createElement("div");
    this.element.className = "ace_sb" + this.classSuffix;
    this.inner = dom.createElement("div");
    this.inner.className = "";
    this.element.appendChild(this.inner);
    this.VScrollWidth = 12;
    this.HScrollHeight = 12;

    parent.appendChild(this.element);

    this.setVisible(false);
    this.skipEvent = false;


    event.addMultiMouseDownListener(this.element, [500, 300, 300], this, "onMouseDown");

};

(function () {
    oop.implement(this, EventEmitter);

    this.setVisible = function (isVisible) {
        this.element.style.display = isVisible ? "" : "none";
        this.isVisible = isVisible;
        this.coeff = 1;
    };


}).call(ScrollBar.prototype);

/**
 * Represents a vertical scroll bar.
 * @class VScrollBar
 **/

/**
 * Creates a new `VScrollBar`. `parent` is the owner of the scroll bar.
 * @param {DOMElement} parent A DOM element
 * @param {Object} renderer An editor renderer
 *
 * @constructor
 **/

var VScrollBar = function (parent, renderer) {
    ScrollBar.call(this, parent);
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.parent = parent;

    // in OSX lion the scrollbars appear to have no width. In this case resize the
    // element to show the scrollbar but still pretend that the scrollbar has a width
    // of 0px
    // in Firefox 6+ scrollbar is hidden if element has the same width as scrollbar
    // make element a little bit wider to retain scrollbar when page is zoomed

    //TODO

    //renderer.$scrollbarWidth = this.width = dom.scrollbarWidth(parent.ownerDocument);
    this.width = this.VScrollWidth;
    this.inner.style.width = this.element.style.width = (this.width || 15) + "px";
    this.$minWidth = 0;
};

oop.inherits(VScrollBar, ScrollBar);

(function () {

    oop.implement(this, EventEmitter);

    /**
     * Emitted when the scroll thumb dragged.
     **/
    this.onMouseDown = function (eType, e) {
        if (eType == "dblclick")
            this.onMouseDoubleClick(e);

        if (eType != "mousedown")
            return

        if (event.getButton(e) != 0 || e.detail == 2) {
            return;
        }

        if (e.target == this.inner) {
            this.onMouseDown2(e);
            return;
        }

        var self = this;
        var mouseY = e.clientY;

        var correction = this.element.getBoundingClientRect().top;


        var onMouseMove = function (e) {
            mouseY = e.clientY;
        };

        var onMouseUp = function () {
            clearInterval(timerId);
        };

        var onScrollInterval = function () {
            if (mouseY === undefined)
                return;
            var desiredPos = mouseY - correction - self.thumbHeight / 2;
            var delta = desiredPos - self.thumbTop;
            var speed = 2;
            if (delta > speed)
                desiredPos = self.thumbTop + speed;
            else if (delta < -speed)
                desiredPos = self.thumbTop - speed;
            else
                desiredPos = self.thumbTop;

            var scrollTop = self.scrollTopFromThumbTop(desiredPos);
            if (scrollTop == self.scrollTop)
                return;
            self._emit("scroll", {data: scrollTop});
        };

        event.capture(this.inner, onMouseMove, onMouseUp);
        var timerId = setInterval(onScrollInterval, 20);

        return event.preventDefault(e);
    };

    this.onMouseDown2 = function (e) {
        var startY = e.clientY;
        var startTop = this.thumbTop;

        var self = this;
        var mousePageY;

        var onMouseMove = function (e) {
            mousePageY = e.clientY;
        };

        var onMouseUp = function () {
            clearInterval(timerId);
        };

        var onScrollInterval = function () {
            if (mousePageY === undefined)
                return;
            var scrollTop = self.scrollTopFromThumbTop(startTop + mousePageY - startY)
            if (scrollTop == self.scrollTop)
                return
            self._emit("scroll", {data: scrollTop});
        };

        event.capture(this.inner, onMouseMove, onMouseUp);
        var timerId = setInterval(onScrollInterval, 20);

        return event.preventDefault(e);
    };

    /**
     * Emitted when the scroll bar double clicked.
     * @event mouse double click
     * @param {Object} e Contains one property, `"data"`, which indicates the current mouse position
     **/
    this.onMouseDoubleClick = function (e) {
        var top = e.clientY - this.element.getBoundingClientRect().top;
        if (top > this.thumbTop + this.thumbHeight)
            top -= this.thumbHeight;
        this._emit("scroll", {data: this.scrollTopFromThumbTop(top)});
    };

    this.getHeight = function () {
        return this.height;
    };

    /**
     * Returns new top for scroll thumb
     * @param {Number}thumbTop
     * @returns {Number}
     **/
    this.scrollTopFromThumbTop = function (thumbTop) {
        var scrollTop = thumbTop * (this.pageHeight - this.viewHeight) / (this.slideHeight - this.thumbHeight);
        scrollTop = scrollTop >> 0;
        if (scrollTop < 0)
            scrollTop = 0;
        else if (scrollTop > this.pageHeight - this.viewHeight)
            scrollTop = this.pageHeight - this.viewHeight;
        return scrollTop
    };

    this.classSuffix = '-v';


    /**
     * Returns the width of the scroll bar.
     * @returns {Number}
     **/
    this.getWidth = function () {
        return Math.max(this.isVisible ? this.width : 0, this.$minWidth || 0);
    };

    /**
     * Sets the height of the scroll bar, in pixels.
     * @param {Number} height The new height
     **/
    this.setHeight = function (height) {
        this.height = Math.max(0, height);
        //this.element.style.height = this.height + "px";
        this.slideHeight = this.height;
        this.viewHeight = this.height;

        // force setInnerHeight updating
        this.setScrollHeight(this.pageHeight, true)
    };

    /**
     * Sets the inner height of the scroll bar, in pixels.
     * @param {Number} height The new inner height
     *
     **/
    this.setInnerHeight =
        /**
         * Sets the scroll height of the scroll bar, in pixels.
         * @param {Number} height The new scroll height
         **/
        this.setScrollHeight = function (height, force) {

            if (this.pageHeight == height && !force)
                return;
            this.pageHeight = height;
            this.thumbHeight = this.slideHeight * this.viewHeight / this.pageHeight;

            if (this.thumbHeight > this.slideHeight)
                this.thumbHeight = this.slideHeight;
            if (this.thumbHeight < 15)
                this.thumbHeight = 15;

            this.inner.style.height = this.thumbHeight + "px";

            if (this.scrollTop > (this.pageHeight - this.viewHeight + 2)) {
                this.scrollTop = (this.pageHeight - this.viewHeight);
                if (this.scrollTop < 0) this.scrollTop = 0;
                this._emit("scroll", {data: this.scrollTop});
            }

        };

    /**
     * Sets the scroll top of the scroll bar.
     * @param {Number} scrollTop The new scroll top
     **/
    this.setScrollTop = function (scrollTop) {
        this.scrollTop = scrollTop;
        if (scrollTop < 0) scrollTop = 0;
        this.thumbTop = scrollTop * (this.slideHeight - this.thumbHeight) / (this.pageHeight - this.viewHeight);
        this.inner.style.top = (this.thumbTop) + "px";
    };


}).call(VScrollBar.prototype);

/**
 * Represents a horisontal scroll bar.
 * @class HScrollBar
 **/

/**
 * Creates a new `HScrollBar`. `parent` is the owner of the scroll bar.
 * @param {DOMElement} parent A DOM element
 * @param {Object} renderer An editor renderer
 *
 * @constructor
 **/
var HScrollBar = function (parent, renderer) {
    ScrollBar.call(this, parent);
    this.scrollLeft = 0;
    this.scrollWidth = 0;

    // in OSX lion the scrollbars appear to have no width. In this case resize the
    // element to show the scrollbar but still pretend that the scrollbar has a width
    // of 0px
    // in Firefox 6+ scrollbar is hidden if element has the same width as scrollbar
    // make element a little bit wider to retain scrollbar when page is zoomed
    //renderer.$scrollbarHeight = this.height = dom.scrollbarHeight(parent.ownerDocument);
    this.height = this.HScrollHeight;
    this.inner.style.height = this.element.style.height = (this.height || 15) + "px";

};

oop.inherits(HScrollBar, ScrollBar);

(function () {

    this.classSuffix = '-h';

    oop.implement(this, EventEmitter);

    /**
     * Emitted when the scroll thumb dragged.
     **/
    this.onMouseDown = function (eType, e) {
        if (eType == "dblclick")
            this.onMouseDoubleClick(e);

        if (eType != "mousedown")
            return;

        if (event.getButton(e) != 0 || e.detail == 2) {
            return;
        }

        if (e.target == this.inner) {
            this.onMouseDown2(e);
            return;
        }

        var self = this;
        var mouseX = e.clientX;

        var correction = this.element.getBoundingClientRect().left;


        var onMouseMove = function (e) {
            mouseX = e.clientX;
        };

        var onMouseUp = function () {
            clearInterval(timerId);
        };

        var onScrollInterval = function () {
            if (mouseX === undefined)
                return;
            var desiredPos = mouseX - correction - self.thumbWidth / 2;
            var delta = desiredPos - self.thumbLeft;
            var speed = 2;
            if (delta > speed)
                desiredPos = self.thumbLeft + speed;
            else if (delta < -speed)
                desiredPos = self.thumbLeft - speed;
            else
                desiredPos = self.thumbLeft;

            var scrollLeft = self.scrollLeftFromThumbLeft(desiredPos);
            if (scrollLeft == self.scrollLeft)
                return;
            self._emit("scroll", {data: scrollLeft});
        };

        event.capture(this.inner, onMouseMove, onMouseUp);
        var timerId = setInterval(onScrollInterval, 20);

        return event.preventDefault(e);
    };

    this.onMouseDown2 = function (e) {
        var startX = e.clientX;
        var startLeft = this.thumbLeft;

        var self = this;
        var mousePageX;

        var onMouseMove = function (e) {
            mousePageX = e.clientX;
        };

        var onMouseUp = function () {
            clearInterval(timerId);
        };

        var onScrollInterval = function () {
            if (mousePageX === undefined)
                return;
            var scrollLeft = self.scrollLeftFromThumbLeft(startLeft + mousePageX - startX);
            if (scrollLeft == self.scrollLeft)
                return;
            self._emit("scroll", {data: scrollLeft});
        };

        event.capture(this.inner, onMouseMove, onMouseUp);
        var timerId = setInterval(onScrollInterval, 20);

        return event.preventDefault(e);
    };

    /**
     * Emitted when the scroll bar double clicked.
     * @event mouse double click
     * @param {Object} e Contains one property, `"data"`, which indicates the current mouse position
     **/
    this.onMouseDoubleClick = function (e) {
        var left = e.clientX - this.element.getBoundingClientRect().left;
        if (left > this.thumbLeft + this.thumbWidth)
            left -= this.thumbWidth;
        this._emit("scroll", {data: this.scrollLeftFromThumbLeft(left)});
    };


    /**
     * Returns the height of the scroll bar.
     * @returns {Number}
     **/
    this.getHeight = function () {
        return this.isVisible ? this.height : 0;
        //return Math.max(this.isVisible ? this.height : 0, this.$minHeight || 0);
    };

    /**
     * Returns new left for scroll thumb
     * @param {Number}thumbLeft
     * @returns {Number}
     **/
    this.scrollLeftFromThumbLeft = function (thumbLeft) {
        var scrollLeft = thumbLeft * (this.pageWidth - this.viewWidth) / (this.slideWidth - this.thumbWidth);
        scrollLeft = scrollLeft >> 0;
        if (scrollLeft < 0)
            scrollLeft = 0;
        else if (scrollLeft > this.pageWidth - this.viewWidth)
            scrollLeft = this.pageWidth - this.viewWidth;
        return scrollLeft;
    };

    /**
     * Sets the width of the scroll bar, in pixels.
     * @param {Number} width The new width
     **/
    this.setWidth = function (width) {

        this.width = Math.max(0, width);
        this.element.style.width = this.width + "px";
        this.element.style.right = this.VScrollWidth + "px";
        this.slideWidth = this.width;
        this.viewWidth = this.width;

        // force setInnerHeight updating
        // this.pageHeight = -1
        this.setScrollWidth(this.pageWidth, true)
    };

    /**
     * Sets the inner width of the scroll bar, in pixels.
     * @param {Number} width The new inner width
     * @deprecated Use setScrollWidth instead
     **/
    this.setInnerWidth =

        /**
         * Sets the scroll width of the scroll bar, in pixels.
         * @param {Number} width The new scroll width
         **/
        this.setScrollWidth = function (width, force) {
            if (this.pageWidth == width && !force)
                return;
            this.pageWidth = width;
            this.thumbWidth = this.slideWidth * this.viewWidth / this.pageWidth;

            if (this.thumbWidth > this.slideWidth)
                this.thumbWidth = this.slideWidth;
            if (this.thumbWidth < 15)
                this.thumbWidth = 15;
            this.inner.style.width = this.thumbWidth + "px";

            if (this.scrollLeft > (this.pageWidth - this.viewWidth + 2)) {
                this.scrollLeft = (this.pageWidth - this.viewWidth);
                if (this.scrollLeft < 0) this.scrollLeft = 0;
                this._emit("scroll", {data: this.scrollLeft});
            }
        };

    /**
     * Sets the scroll left of the scroll bar.
     * @param {Number} scrollLeft The new scroll left
     **/
    this.setScrollLeft = function (scrollLeft) {
        this.scrollLeft = scrollLeft;
        if (scrollLeft < 0) scrollLeft = 0;
        this.thumbLeft = scrollLeft * (this.slideWidth - this.thumbWidth) / (this.pageWidth - this.viewWidth);
        this.inner.style.left = (this.thumbLeft) + "px";
    };

}).call(HScrollBar.prototype);

exports.ScrollBar = VScrollBar; // backward compatibility
exports.ScrollBarV = VScrollBar; // backward compatibility
exports.ScrollBarH = HScrollBar; // backward compatibility

exports.VScrollBar = VScrollBar;
exports.HScrollBar = HScrollBar;
});