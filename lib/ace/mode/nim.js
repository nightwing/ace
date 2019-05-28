
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { NimHighlightRules } from './nim_highlight_rules.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

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
