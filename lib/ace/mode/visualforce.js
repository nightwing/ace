/* caption: Visualforce; extensions: component,page,vfp */

"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { VisualforceHighlightRules } from './visualforce_highlight_rules';
import { XmlBehaviour } from './behaviour/xml';
import { FoldMode as HtmlFoldMode } from './folding/html';

function VisualforceMode() {
    HtmlMode.call(this);

    this.HighlightRules = VisualforceHighlightRules;
    this.foldingRules = new HtmlFoldMode();
    this.$behaviour = new XmlBehaviour();
}

oop.inherits(VisualforceMode, HtmlMode);

VisualforceMode.prototype.emmetConfig = {
    profile: "xhtml"
};

export const Mode = VisualforceMode;
