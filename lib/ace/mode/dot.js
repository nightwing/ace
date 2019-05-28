
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';
import { DotHighlightRules } from './dot_highlight_rules.js';
import { FoldMode as DotFoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = DotHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new DotFoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = ["//", "#"];
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
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

    this.$id = "ace/mode/dot";
}).call(Mode.prototype);

export { Mode };
