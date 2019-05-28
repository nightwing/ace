
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { LatexHighlightRules } from './latex_highlight_rules.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as LatexFoldMode } from './folding/latex.js';

var Mode = function() {
    this.HighlightRules = LatexHighlightRules;
    this.foldingRules = new LatexFoldMode();
    this.$behaviour = new CstyleBehaviour({ braces: true });
};
oop.inherits(Mode, TextMode);

(function() {
    this.type = "text";
    
    this.lineCommentStart = "%";

    this.$id = "ace/mode/latex";
    
    this.getMatching = function(session, row, column) {
        if (row == undefined)
            row = session.selection.lead;
        if (typeof row == "object") {
            column = row.column;
            row = row.row;
        }

        var startToken = session.getTokenAt(row, column);
        if (!startToken)
            return;
        if (startToken.value == "\\begin" || startToken.value == "\\end") {
            return this.foldingRules.latexBlock(session, row, column, true);
        }
    };
}).call(Mode.prototype);

export { Mode };
