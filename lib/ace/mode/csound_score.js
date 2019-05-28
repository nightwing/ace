
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CsoundScoreHighlightRules } from './csound_score_highlight_rules';

var Mode = function() {
    this.HighlightRules = CsoundScoreHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = ";";
    this.blockComment = {start: "/*", end: "*/"};

}).call(Mode.prototype);

export { Mode };
