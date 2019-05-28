/* global define */

"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { HandlebarsHighlightRules } from './handlebars_highlight_rules';
import { HtmlBehaviour } from './behaviour/html';
import { FoldMode as HtmlFoldMode } from './folding/html';

var Mode = function() {
    HtmlMode.call(this);
    this.HighlightRules = HandlebarsHighlightRules;
    this.$behaviour = new HtmlBehaviour();
};

oop.inherits(Mode, HtmlMode);

(function() {
    this.blockComment = {start: "{{!--", end: "--}}"};
    this.$id = "ace/mode/handlebars";
}).call(Mode.prototype);

export { Mode };
