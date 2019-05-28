
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { FtlHighlightRules } from './ftl_highlight_rules';

var Mode = function() {
    this.HighlightRules = FtlHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.$id = "ace/mode/ftl";
}).call(Mode.prototype);

export { Mode };
