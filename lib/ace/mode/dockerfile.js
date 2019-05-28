
"use strict";

import oop from '../lib/oop';
import { Mode as ShMode } from './sh';
import { DockerfileHighlightRules } from './dockerfile_highlight_rules';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    ShMode.call(this);
    
    this.HighlightRules = DockerfileHighlightRules;
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, ShMode);

(function() {
    this.$id = "ace/mode/dockerfile";
}).call(Mode.prototype);

export { Mode };
