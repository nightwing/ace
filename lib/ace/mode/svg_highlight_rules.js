
"use strict";

import oop from '../lib/oop';
import { JavaScriptHighlightRules } from './javascript_highlight_rules';
import { XmlHighlightRules } from './xml_highlight_rules';

var SvgHighlightRules = function() {
    XmlHighlightRules.call(this);

    this.embedTagRules(JavaScriptHighlightRules, "js-", "script");

    this.normalizeRules();
};

oop.inherits(SvgHighlightRules, XmlHighlightRules);

export { SvgHighlightRules };
