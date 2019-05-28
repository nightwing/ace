
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { NimHighlightRules } from './nim_highlight_rules';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function () {
    TextMode.call(this);
    this.HighlightRules = NimHighlightRules;
    this.foldingRules = new CStyleFoldMode();
};

oop.inherits(Mode, TextMode);


(function () {
    this.lineCommentStart = "#";
    this.blockComment = {start: "#[", end: "]#", nestable: true};


    this.$id = "ace/mode/nim";
}).call(Mode.prototype);

export { Mode };
