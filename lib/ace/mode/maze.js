
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { MazeHighlightRules } from './maze_highlight_rules.js';
import { FoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = MazeHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "//";
    this.$id = "ace/mode/maze";
}).call(Mode.prototype);

export { Mode };
