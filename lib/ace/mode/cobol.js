
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { CobolHighlightRules } from './cobol_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = CobolHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "*";

    this.$id = "ace/mode/cobol";
}).call(Mode.prototype);

export { Mode };
