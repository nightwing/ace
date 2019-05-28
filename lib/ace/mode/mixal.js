
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { MixalHighlightRules } from './mixal_highlight_rules';

var Mode = function() {
    this.HighlightRules = MixalHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/mixal";
    this.lineCommentStart = "*";
}).call(Mode.prototype);

export { Mode };
