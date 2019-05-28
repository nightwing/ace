
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { IniHighlightRules } from './ini_highlight_rules.js';

// TODO: pick appropriate fold mode
import { FoldMode } from './folding/ini.js';

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
