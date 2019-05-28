
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { EiffelHighlightRules } from './eiffel_highlight_rules';

var Mode = function() {
    this.HighlightRules = EiffelHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.$id = "ace/mode/eiffel";
}).call(Mode.prototype);

export { Mode };
