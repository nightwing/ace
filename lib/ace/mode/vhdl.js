
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { VHDLHighlightRules } from './vhdl_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = VHDLHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "--";

    this.$id = "ace/mode/vhdl";
}).call(Mode.prototype);

export { Mode };
