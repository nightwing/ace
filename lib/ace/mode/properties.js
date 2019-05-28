
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { PropertiesHighlightRules } from './properties_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = PropertiesHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/properties";
}).call(Mode.prototype);

export { Mode };
