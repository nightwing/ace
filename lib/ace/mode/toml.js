
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { TomlHighlightRules } from './toml_highlight_rules';
import { FoldMode } from './folding/ini';

var Mode = function() {
    this.HighlightRules = TomlHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "#";
    this.$id = "ace/mode/toml";
}).call(Mode.prototype);

export { Mode };
