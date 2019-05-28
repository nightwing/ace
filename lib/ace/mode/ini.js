
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { IniHighlightRules } from './ini_highlight_rules';

// TODO: pick appropriate fold mode
import { FoldMode } from './folding/ini';

var Mode = function() {
    this.HighlightRules = IniHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = ";";
    this.blockComment = null;
    this.$id = "ace/mode/ini";
}).call(Mode.prototype);

export { Mode };
