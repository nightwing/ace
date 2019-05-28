
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { GitignoreHighlightRules } from './gitignore_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = GitignoreHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "#";
    this.$id = "ace/mode/gitignore";
}).call(Mode.prototype);

export { Mode };
