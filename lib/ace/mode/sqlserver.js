
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { SqlHighlightRules as SqlServerHighlightRules } from './sqlserver_highlight_rules';
import { FoldMode as SqlServerFoldMode } from './folding/sqlserver';

var Mode = function() {
    this.HighlightRules = SqlServerHighlightRules;
    this.foldingRules = new SqlServerFoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.blockComment = {start: "/*", end: "*/"};
    
    /**
     * Override keyword completions using list created in highlight rules
     */
    this.getCompletions = function(state, session, pos, prefix) {
        return session.$mode.$highlightRules.completions;
    };
    
    this.$id = "ace/mode/sql";
}).call(Mode.prototype);

export { Mode };
