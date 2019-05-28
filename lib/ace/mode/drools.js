
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { DroolsHighlightRules } from './drools_highlight_rules';
import { FoldMode as DroolsFoldMode } from './folding/drools';

var Mode = function() {
    this.HighlightRules = DroolsHighlightRules;
    this.foldingRules = new DroolsFoldMode();
    this.$behaviour = this.$defaultBehaviour;

};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "//";
    this.$id = "ace/mode/drools";
}).call(Mode.prototype);

export { Mode };
