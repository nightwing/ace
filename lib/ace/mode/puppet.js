
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { PuppetHighlightRules } from './puppet_highlight_rules.js';
import { CstyleBehaviour } from './behaviour/cstyle.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';
import { MatchingBraceOutdent } from './matching_brace_outdent.js';

var Mode = function () {
    TextMode.call(this);
    this.HighlightRules = PuppetHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};

oop.inherits(Mode, TextMode);


(function () {
    this.$id = "ace/mode/puppet";
}).call(Mode.prototype);

export { Mode };
