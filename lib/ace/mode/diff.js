
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { DiffHighlightRules as HighlightRules } from './diff_highlight_rules.js';
import { FoldMode } from './folding/diff.js';

var Mode = function() {
    this.HighlightRules = HighlightRules;
    this.foldingRules = new FoldMode(["diff", "@@|\\*{5}"], "i");
};
oop.inherits(Mode, TextMode);

(function() {

    this.$id = "ace/mode/diff";
}).call(Mode.prototype);

export { Mode };
