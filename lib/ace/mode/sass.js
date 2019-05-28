
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { SassHighlightRules } from './sass_highlight_rules.js';
import { FoldMode } from './folding/coffee.js';

var Mode = function() {
    this.HighlightRules = SassHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {   
    this.lineCommentStart = "//";
    this.$id = "ace/mode/sass";
}).call(Mode.prototype);

export { Mode };
