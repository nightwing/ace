
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { EdifactHighlightRules } from './edifact_highlight_rules.js';

var Mode = function() {
   
    this.HighlightRules = EdifactHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/edifact";
}).call(Mode.prototype);

export { Mode };
