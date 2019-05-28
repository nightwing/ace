
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { AppleScriptHighlightRules } from './applescript_highlight_rules.js';
import { FoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = AppleScriptHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.blockComment = {start: "(*", end: "*)"};
    this.$id = "ace/mode/applescript";
    // Extra logic goes here.
}).call(Mode.prototype);

export { Mode };
