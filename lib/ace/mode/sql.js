
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { SqlHighlightRules } from './sql_highlight_rules';

var Mode = function() {
    this.HighlightRules = SqlHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "--";

    this.$id = "ace/mode/sql";
}).call(Mode.prototype);

export { Mode };
