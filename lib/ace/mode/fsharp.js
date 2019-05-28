
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { FSharpHighlightRules } from './fsharp_highlight_rules';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function () {
    TextMode.call(this);
    this.HighlightRules = FSharpHighlightRules;
    this.foldingRules = new CStyleFoldMode();
};

oop.inherits(Mode, TextMode);


(function () {
    this.lineCommentStart = "//";
    this.blockComment = {start: "(*", end: "*)", nestable: true};


    this.$id = "ace/mode/fsharp";
}).call(Mode.prototype);

export { Mode };
