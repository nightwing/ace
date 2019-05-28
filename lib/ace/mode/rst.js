
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { RSTHighlightRules } from './rst_highlight_rules';

var Mode = function() {
    this.HighlightRules = RSTHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.type = "text";

    this.$id = "ace/mode/rst";
}).call(Mode.prototype);

export { Mode };
