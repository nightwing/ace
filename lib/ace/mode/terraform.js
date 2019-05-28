
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { TerraformHighlightRules } from './terraform_highlight_rules';
import { CstyleBehaviour } from './behaviour/cstyle';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';
import { MatchingBraceOutdent } from './matching_brace_outdent';

var Mode = function () {
    TextMode.call(this);
    this.HighlightRules = TerraformHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};

oop.inherits(Mode, TextMode);


(function () {
    this.$id = "ace/mode/terraform";
}).call(Mode.prototype);

export { Mode };
