
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CsoundOrchestraHighlightRules } from './csound_orchestra_highlight_rules';

var Mode = function() {
    this.HighlightRules = CsoundOrchestraHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = ";";
    this.blockComment = {start: "/*", end: "*/"};

}).call(Mode.prototype);

export { Mode };
