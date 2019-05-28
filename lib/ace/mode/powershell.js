
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { PowershellHighlightRules } from './powershell_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    this.HighlightRules = PowershellHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode({start: "^\\s*(<#)", end: "^[#\\s]>\\s*$"});
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "#";
    this.blockComment = {start: "<#", end: "#>"};
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

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


    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/powershell";
}).call(Mode.prototype);

export { Mode };
