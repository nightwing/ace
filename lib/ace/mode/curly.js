
"use strict";

import oop from '../lib/oop';

// defines the parent mode
import { Mode as HtmlMode } from './html';

import { MatchingBraceOutdent } from './matching_brace_outdent';
import { FoldMode as HtmlFoldMode } from './folding/html';

// defines the language specific highlighters and folding rules
import { CurlyHighlightRules } from './curly_highlight_rules';

var Mode = function() {
    HtmlMode.call(this);
    this.HighlightRules = CurlyHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new HtmlFoldMode();
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.$id = "ace/mode/curly";
}).call(Mode.prototype);

export { Mode };
