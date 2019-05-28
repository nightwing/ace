

import oop from '../lib/oop';
import { Mode as TextMode } from '../mode/text';
import { PgsqlHighlightRules } from './pgsql_highlight_rules';

var Mode = function() {
    this.HighlightRules = PgsqlHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) { 
        if (state == "start" || state == "keyword.statementEnd") {
            return "";
        } else {
            return this.$getIndent(line); // Keep whatever indent the previous line has
        }
    };

    this.$id = "ace/mode/pgsql";
}).call(Mode.prototype);

export { Mode };
