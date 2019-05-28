
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { FtlHighlightRules } from './ftl_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = FtlHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.$id = "ace/mode/ftl";
}).call(Mode.prototype);

export { Mode };
