
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { ASLHighlightRules } from './asl_highlight_rules.js';
import { FoldMode } from './folding/cstyle.js';

var Mode = function () {
    this.HighlightRules = ASLHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function () {
    this.$id = "ace/mode/asl";
}).call(Mode.prototype);

export { Mode };
