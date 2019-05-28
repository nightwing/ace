
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { CsoundOrchestraHighlightRules } from './csound_orchestra_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = CsoundOrchestraHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = ";";
    this.blockComment = {start: "/*", end: "*/"};

}).call(Mode.prototype);

export { Mode };
