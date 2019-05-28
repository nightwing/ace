
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { SassHighlightRules } from './sass_highlight_rules';
import { FoldMode } from './folding/coffee';

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
