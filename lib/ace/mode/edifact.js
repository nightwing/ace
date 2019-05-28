
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { EdifactHighlightRules } from './edifact_highlight_rules';

var Mode = function() {
   
    this.HighlightRules = EdifactHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/edifact";
}).call(Mode.prototype);

export { Mode };
