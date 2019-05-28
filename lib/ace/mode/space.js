
"use strict";
import oop from '../lib/oop';

// defines the parent mode
import { Mode as TextMode } from './text';

import { FoldMode } from './folding/coffee';

// defines the language specific highlighters and folding rules
import { SpaceHighlightRules } from './space_highlight_rules';

var Mode = function() {
    // set everything up
    this.HighlightRules = SpaceHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);
(function() {
    
    this.$id = "ace/mode/space";
}).call(Mode.prototype);
export { Mode };
