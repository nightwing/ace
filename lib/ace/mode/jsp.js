
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { JspHighlightRules } from './jsp_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

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
