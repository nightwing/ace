
"use strict";

import { AbapHighlightRules as Rules } from './abap_highlight_rules';
import { FoldMode } from './folding/coffee';
import { Range } from '../range';
import { Mode as TextMode } from './text';
import oop from '../lib/oop';

function Mode() {
    this.HighlightRules = Rules;
    this.foldingRules = new FoldMode();
}

oop.inherits(Mode, TextMode);

(function() {
    
    this.lineCommentStart = '"';
    
    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        return indent;
    };    
    
    this.$id = "ace/mode/abap";
}).call(Mode.prototype);

export { Mode };
