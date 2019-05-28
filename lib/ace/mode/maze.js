
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { MazeHighlightRules } from './maze_highlight_rules';
import { FoldMode } from './folding/cstyle';

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
