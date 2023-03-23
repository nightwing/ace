"use strict";

var dom = require("ace/lib/dom");
var oop = require("ace/lib/oop");
var event = require("ace/lib/event");
var Range = require("ace/range").Range;
var HoverTooltip = require("ace/tooltips/hover_tooltip").HoverTooltip

function TokenTooltip (editor) {
    if (editor.tokenTooltip)
        return;
    HoverTooltip.call(this, editor);
    editor.tokenTooltip = this;
    this.editor = editor;

    this.token = {};
    this.range = new Range();
    
    this.setCallback(function(session, pos, callback) {        
        callback(this.getContent());
    });
}

oop.inherits(TokenTooltip, HoverTooltip);

(function(){
    
    this.getContent = function() {
        var r = this.editor.renderer;
        if (this.lastT - (r.timeStamp || 0) > 1000) {
            r.rect = null;
            r.timeStamp = this.lastT;
            this.maxHeight = window.innerHeight;
            this.maxWidth = window.innerWidth;
        }

        var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
        var offset = (this.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
        var row = Math.floor((this.y + r.scrollTop - canvasPos.top) / r.lineHeight);
        var col = Math.round(offset);

        var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
        var session = this.editor.session;
        var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
        var token = session.getTokenAt(docPos.row, docPos.column);

        if (!token && !session.getLine(docPos.row)) {
            token = {
                type: "",
                value: "",
                state: session.bgTokenizer.getState(0)
            };
        }
        if (!token) {
            session.removeMarker(this.marker);
            this.hide();
            return;
        }

        var tokenText = token.type;
        if (token.state)
            tokenText += "|" + token.state;
        if (token.merge)
            tokenText += "\n  merge";
        if (token.stateTransitions)
            tokenText += "\n  " + token.stateTransitions.join("\n  ");

        if (this.tokenText != tokenText) {
            this.tokenText = tokenText;
        }

        this.show(null, this.x, this.y);

        this.token = token;
        this.range = new Range(docPos.row, token.start, docPos.row, token.start + token.value.length);
        return {
            content: tokenText,
            range: this.range
        }
    };    

}).call(TokenTooltip.prototype);

exports.TokenTooltip = TokenTooltip;
