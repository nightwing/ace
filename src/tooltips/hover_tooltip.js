"use strict";

var Tooltip = require("../tooltip").Tooltip;
var oop = require("../lib/oop");

/**
 *
 * @param {Ace.Editor} editor
 * @constructor
 */
function HoverTooltip(editor) {
    Tooltip.call(this, document.body);
    this.editor = editor;
    this.$mouseMoveTimer = null;
    this.$showTimer = null;
    this.isOpen = false;

    var element = this.getElement()
    element.style.pointerEvents = "auto";
    element.style.whiteSpace = "pre-wrap";
    element.addEventListener("mouseout", this.onMouseOut.bind(this));
    element.tabIndex = -1;
    
    this.editor.on("mousemove", this.onMouseMove.bind(this));
}

oop.inherits(HoverTooltip, Tooltip);

(function () {
    this.update = function (editor) {
        clearTimeout(this.$mouseMoveTimer);
        clearTimeout(this.$showTimer);
        if (this.isOpen) {
            this.showPopup();
        }
        else {
            this.$mouseMoveTimer = setTimeout(() => {
                this.showPopup();
                this.$mouseMoveTimer = undefined;
            }, 500);

        }
    };
    /**
     *
     * @param {(session: Ace.EditSession, docPos: Ace.Position, 
     * tooltipCallback: (tooltip: {content: string, range: Ace.Range}) => void) => void} callback
     */
    this.setCallback = function (callback) {
        this.callback = callback;
    };

    this.onMouseMove = function(e) {
        this.x = e.clientX;
        this.y = e.clientY;
        this.update(e["editor"]);
    };

    this.showPopup = function() {
        let renderer = this.editor.renderer;
        let screenCoordinates = renderer.pixelToScreenCoordinates(this.x, this.y);

        let session = this.editor.session;
        let docPos = session.screenToDocumentPosition(screenCoordinates.row, screenCoordinates.column);
        if (!this.callback) {
            return;
        }
        this.callback(session, docPos, (tooltip) => {
            let descriptionText = tooltip ? tooltip.content : null;
            if (!tooltip || !descriptionText) {
                this.hide();
                return;
            }

            let token = session.getTokenAt(docPos.row, docPos.column + 1);
            let row, column;
            if (tooltip.range && tooltip.range.start) {
                row = tooltip.range.start.row;
                column = tooltip.range.start.column;
            } else {
                row = docPos.row;
                column = token && token.start || 0
            }
            
            if (this.marker) {
                session.removeMarker(this.marker);
                this.marker = null;
            }
            if (tooltip.range) {
                this.marker = session.addMarker(tooltip.range, "ace_bracket", "text");
            }

            if (this.descriptionText != descriptionText) {
                this.hide();
                this.setHtml(descriptionText);
                this.descriptionText = descriptionText;
            }
            else if (this.row == row && this.column == column && this.isOpen) {
                return;
            }

            this.row = row;
            this.column = column;

            if (this.$mouseMoveTimer) {
                this.$show();
            }
            else {
                this.$showTimer = setTimeout(() => {
                    this.$show();
                    this.$showTimer = undefined;
                }, 100);
            }
        });
    };

    this.$show = function () {
        if (!this.editor) return;
        let renderer = this.editor.renderer;
        let position = renderer.textToScreenCoordinates(this.row, this.column);

        let cursorPos = this.editor.getCursorPosition();

        this.show(null, position.pageX, position.pageY);

        let labelHeight = this.getElement().getBoundingClientRect().height;
        let rect = renderer.scroller.getBoundingClientRect();

        let isTopdown = true;
        if (this.row > cursorPos.row)
            // don't obscure cursor
            isTopdown = true; else if (this.row < cursorPos.row)
            // don't obscure cursor
            isTopdown = false;
        if (position.pageY - labelHeight + renderer.lineHeight < rect.top)
            // not enough space above us
            isTopdown = true; else if (position.pageY + labelHeight > rect.bottom) isTopdown = false;

        if (!isTopdown) position.pageY -= labelHeight; else position.pageY += renderer.lineHeight;

        this.getElement().style.maxWidth = rect.width - (position.pageX - rect.left) + "px";
        this.show(null, position.pageX, position.pageY);
    };

    this.show = function (text, x, y) {
        if (text != null) this.setText(text);
        if (x != null && y != null) this.setPosition(x, y);
        if (!this.isOpen) {
            this.getElement().style.display = "block";
            this.isOpen = true;
        }
        this.$registerEditorEvents();
    };

    this.$hide = function () {
        if (this.getElement().contains(document.activeElment)) return;
        clearTimeout(this.$mouseMoveTimer);
        clearTimeout(this.$showTimer);
        if (this.isOpen) {
            this.$removeEditorEvents();
            this.hide();
        }
        if (this.marker) {
            session.removeMarker(this.marker);
            this.marker = null;
        }
    };

    this.$registerEditorEvents = function () {
        this.editor.on("change", this.$hide.bind(this));
        this.editor.on("mousewheel", this.$hide.bind(this));
        this.editor.on("mousedown", this.$hide.bind(this));
    };

    this.$removeEditorEvents = function () {
        this.editor.off("change", this.$hide.bind(this));
        this.editor.off("mousewheel", this.$hide.bind(this));
        this.editor.off("mousedown", this.$hide.bind(this));
    };

    this.onMouseOut = function(e) {
        if (this.getElement().contains(document.activeElment)) return;
        clearTimeout(this.$mouseMoveTimer);
        clearTimeout(this.$showTimer);
        if (!e.relatedTarget || e.relatedTarget == this.getElement()) return;

        if (e && e.currentTarget.contains(e.relatedTarget)) return;
        if (!e.relatedTarget.classList.contains("ace_content")) this.$hide();
    };


}).call(HoverTooltip.prototype);

exports.HoverTooltip = HoverTooltip;
