
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { MatlabHighlightRules } from './matlab_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = MatlabHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "%";
    this.blockComment = {start: "%{", end: "%}"};

    this.$id = "ace/mode/matlab";
}).call(Mode.prototype);

export { Mode };
