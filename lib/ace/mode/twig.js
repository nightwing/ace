
"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { TwigHighlightRules } from './twig_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';

var Mode = function() {
    HtmlMode.call(this);
    this.HighlightRules = TwigHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.blockComment = {start: "{#", end: "#}"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
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
    this.$id = "ace/mode/twig";
}).call(Mode.prototype);

export { Mode };
