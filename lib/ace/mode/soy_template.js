
"use strict";

import oop from '../lib/oop.js';
import { Mode as HtmlMode } from './html.js';
import { SoyTemplateHighlightRules } from './soy_template_highlight_rules.js';

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
