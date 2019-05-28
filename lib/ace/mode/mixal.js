
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { MixalHighlightRules } from './mixal_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = MixalHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/mixal";
    this.lineCommentStart = "*";
}).call(Mode.prototype);

export { Mode };
