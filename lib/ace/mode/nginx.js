
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { NginxHighlightRules } from './nginx_highlight_rules.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

var Mode = function () {
    TextMode.call(this);
    this.HighlightRules = NginxHighlightRules;
    this.foldingRules = new CStyleFoldMode();
};

oop.inherits(Mode, TextMode);


(function () {
    this.lineCommentStart = "#";

    this.$id = "ace/mode/nginx";
}).call(Mode.prototype);

export { Mode };
