
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { CirruHighlightRules } from './cirru_highlight_rules.js';
import { FoldMode as CoffeeFoldMode } from './folding/coffee.js';

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
