
"use strict";

import oop from '../lib/oop.js';
import { JavaScriptHighlightRules } from './javascript_highlight_rules.js';
import { XmlHighlightRules } from './xml_highlight_rules.js';

var SvgHighlightRules = function() {
    XmlHighlightRules.call(this);

    this.embedTagRules(JavaScriptHighlightRules, "js-", "script");

    this.normalizeRules();
};

oop.inherits(SvgHighlightRules, XmlHighlightRules);

export { SvgHighlightRules };
