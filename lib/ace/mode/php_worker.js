
"use strict";

import oop from '../lib/oop';
import { Mirror } from '../worker/mirror';
import { PHP } from './php/php';

var PhpWorker = exports.PhpWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);
};

oop.inherits(PhpWorker, Mirror);

(function() {
    this.setOptions = function(opts) {
        this.inlinePhp = opts && opts.inline;
    };
    
    this.onUpdate = function() {
        var value = this.doc.getValue();
        var errors = [];

        // var start = new Date();
        if (this.inlinePhp)
            value = "<?" + value + "?>";

        var tokens = PHP.Lexer(value, {short_open_tag: 1});
        try {
            new PHP.Parser(tokens);
        } catch(e) {
            errors.push({
                row: e.line - 1,
                column: null,
                text: e.message.charAt(0).toUpperCase() + e.message.substring(1),
                type: "error"
            });
        }

        // console.log("lint time: " + (new Date() - start));

        this.sender.emit("annotate", errors);
    };

}).call(PhpWorker.prototype);
