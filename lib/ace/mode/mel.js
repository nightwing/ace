
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { MELHighlightRules } from './mel_highlight_rules';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    this.HighlightRules = MELHighlightRules;
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$id = "ace/mode/mel";
}).call(Mode.prototype);

export { Mode };
