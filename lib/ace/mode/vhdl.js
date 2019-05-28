
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { VHDLHighlightRules } from './vhdl_highlight_rules';

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
