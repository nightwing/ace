
"use strict";

import oop from '../lib/oop';
import { Mode as CMode } from './c_cpp';
import { glslHighlightRules } from './glsl_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { Range } from '../range';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

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
