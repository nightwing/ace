/* caption: Apex; extensions: apex,cls,trigger,tgr */

"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from '../mode/text';
import { ApexHighlightRules } from './apex_highlight_rules';
import { FoldMode } from '../mode/folding/cstyle';
import { CstyleBehaviour } from '../mode/behaviour/cstyle';

function ApexMode() {
    TextMode.call(this);

    this.HighlightRules = ApexHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = new CstyleBehaviour();
}

oop.inherits(ApexMode, TextMode);

ApexMode.prototype.lineCommentStart = "//";

ApexMode.prototype.blockComment = {
    start: "/*",
    end: "*/"
};

export const Mode = ApexMode;
