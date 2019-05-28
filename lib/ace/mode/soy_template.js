
"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { SoyTemplateHighlightRules } from './soy_template_highlight_rules';

var Mode = function() {
    HtmlMode.call(this);
    this.HighlightRules = SoyTemplateHighlightRules;
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$id = "ace/mode/soy_template";
}).call(Mode.prototype);

export { Mode };
