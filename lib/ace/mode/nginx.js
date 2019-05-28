
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { NginxHighlightRules } from './nginx_highlight_rules';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

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
