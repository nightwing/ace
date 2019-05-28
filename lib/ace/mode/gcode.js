
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { GcodeHighlightRules } from './gcode_highlight_rules.js';
import { Range } from '../range.js';

var Mode = function() {
    this.HighlightRules = GcodeHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/gcode";
}).call(Mode.prototype);

export { Mode };
