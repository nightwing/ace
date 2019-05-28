
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { LessHighlightRules } from './less_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { CssBehaviour } from './behaviour/css';
import { CssCompletions } from './css_completions';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    this.HighlightRules = LessHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CssBehaviour();
    this.$completer = new CssCompletions();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        // ignore braces in comments
        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        var match = line.match(/^.*\{\s*$/);
        if (match) {
            indent += tab;
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.getCompletions = function(state, session, pos, prefix) {
        // CSS completions only work with single (not nested) rulesets
        return this.$completer.getCompletions("ruleset", session, pos, prefix);
    };

    this.$id = "ace/mode/less";
}).call(Mode.prototype);

export { Mode };
