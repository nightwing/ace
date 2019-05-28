
"use strict";
import oop from '../lib/oop';
import { Mode as JSMode } from './javascript';
import { SJSHighlightRules } from './sjs_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    this.HighlightRules = SJSHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, JSMode);
(function() {
    // disable jshint
    this.createWorker = function(session) {
        return null;
    };
    this.$id = "ace/mode/sjs";
}).call(Mode.prototype);

export { Mode };
