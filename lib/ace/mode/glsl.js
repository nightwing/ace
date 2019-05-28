
"use strict";

import oop from '../lib/oop.js';
import { Mode as CMode } from './c_cpp.js';
import { glslHighlightRules } from './glsl_highlight_rules.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';
import { Range } from '../range.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = glslHighlightRules;
    
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, CMode);

(function() {
    this.$id = "ace/mode/glsl";
}).call(Mode.prototype);

export { Mode };
