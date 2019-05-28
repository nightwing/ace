

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { GolangHighlightRules } from './golang_highlight_rules.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = GolangHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
    this.$behaviour = new CstyleBehaviour();
};
oop.inherits(Mode, TextMode);

(function() {
    
    this.lineCommentStart = "//";
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
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };//end getNextLineIndent

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.$id = "ace/mode/golang";
}).call(Mode.prototype);

export { Mode };
