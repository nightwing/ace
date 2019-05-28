/* caption: Visualforce; extensions: component,page,vfp */

"use strict";

import oop from '../lib/oop.js';
import { Mode as HtmlMode } from './html.js';
import { VisualforceHighlightRules } from './visualforce_highlight_rules.js';
import { XmlBehaviour } from './behaviour/xml.js';
import { FoldMode as HtmlFoldMode } from './folding/html.js';

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
