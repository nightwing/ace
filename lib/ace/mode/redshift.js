

import oop from '../lib/oop';
import { Mode as TextMode } from '../mode/text';
import { RedshiftHighlightRules } from './redshift_highlight_rules';
import { Range } from '../range';

var Mode = function() {
    this.HighlightRules = RedshiftHighlightRules;
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

    this.$id = "ace/mode/redshift";
}).call(Mode.prototype);

export { Mode };
