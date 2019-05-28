
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CirruHighlightRules } from './cirru_highlight_rules';
import { FoldMode as CoffeeFoldMode } from './folding/coffee';

var Mode = function() {
    this.HighlightRules = CirruHighlightRules;
    this.foldingRules = new CoffeeFoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.$id = "ace/mode/cirru";
}).call(Mode.prototype);

export { Mode };
