
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { C9SearchHighlightRules } from './c9search_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { FoldMode as C9StyleFoldMode } from './folding/c9search';

var Mode = function() {
    this.HighlightRules = C9SearchHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new C9StyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.$id = "ace/mode/c9search";
}).call(Mode.prototype);

export { Mode };
