
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { MatlabHighlightRules } from './matlab_highlight_rules';

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
