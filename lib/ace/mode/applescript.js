
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { AppleScriptHighlightRules } from './applescript_highlight_rules';
import { FoldMode } from './folding/cstyle';

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
