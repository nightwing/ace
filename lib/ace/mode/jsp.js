
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { JspHighlightRules } from './jsp_highlight_rules.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = JspHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.$id = "ace/mode/jsp";
}).call(Mode.prototype);

export { Mode };
