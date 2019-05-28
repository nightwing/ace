
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { TextileHighlightRules } from './textile_highlight_rules.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';

var Mode = function() {
    this.HighlightRules = TextileHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.type = "text";
    this.getNextLineIndent = function(state, line, tab) {
        if (state == "intag")
            return tab;
        
        return "";
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    this.$id = "ace/mode/textile";
}).call(Mode.prototype);

export { Mode };
