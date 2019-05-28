
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { GcodeHighlightRules } from './gcode_highlight_rules';
import { Range } from '../range';

var Mode = function() {
    this.HighlightRules = GcodeHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/gcode";
}).call(Mode.prototype);

export { Mode };
