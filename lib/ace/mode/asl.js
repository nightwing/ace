
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { ASLHighlightRules } from './asl_highlight_rules';
import { FoldMode } from './folding/cstyle';

var Mode = function () {
    this.HighlightRules = ASLHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function () {
    this.$id = "ace/mode/asl";
}).call(Mode.prototype);

export { Mode };
