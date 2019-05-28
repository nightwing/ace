
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { HjsonHighlightRules } from './hjson_highlight_rules.js';
import { FoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = HjsonHighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "//";
    this.blockComment = { start: "/*", end: "*/" };
    this.$id = "ace/mode/hjson";
}).call(Mode.prototype);

export { Mode };
