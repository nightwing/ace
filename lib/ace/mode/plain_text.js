
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { TextHighlightRules } from './text_highlight_rules';
import { Behaviour } from './behaviour';

var Mode = function() {
    this.HighlightRules = TextHighlightRules;
    this.$behaviour = new Behaviour();
};

oop.inherits(Mode, TextMode);

(function() {
    this.type = "text";
    this.getNextLineIndent = function(state, line, tab) {
        return '';
    };
    this.$id = "ace/mode/plain_text";
}).call(Mode.prototype);

export { Mode };
