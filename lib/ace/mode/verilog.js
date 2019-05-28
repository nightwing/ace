
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { VerilogHighlightRules } from './verilog_highlight_rules';
import { Range } from '../range';

var Mode = function() {
    this.HighlightRules = VerilogHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$quotes = { '"': '"' };


    this.$id = "ace/mode/verilog";
}).call(Mode.prototype);

export { Mode };
