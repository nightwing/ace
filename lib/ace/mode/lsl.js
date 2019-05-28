
"use strict";

import { LSLHighlightRules as Rules } from './lsl_highlight_rules.js';
import { MatchingBraceOutdent as Outdent } from './matching_brace_outdent.js';
import { Range } from '../range.js';
import { Mode as TextMode } from './text.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';
import oop from '../lib/oop.js';

var Mode = function() {
    this.HighlightRules = Rules;
    this.$outdent = new Outdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = ["//"];

    this.blockComment = {
        start: "/*",
        end: "*/"
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type === "comment.block.lsl") {
            return indent;
        }

        if (state === "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.$id = "ace/mode/lsl";
}).call(Mode.prototype);

export { Mode };
