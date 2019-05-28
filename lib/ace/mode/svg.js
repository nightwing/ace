
"use strict";

import oop from '../lib/oop.js';
import { Mode as XmlMode } from './xml.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { SvgHighlightRules } from './svg_highlight_rules.js';
import { FoldMode as MixedFoldMode } from './folding/mixed.js';
import { FoldMode as XmlFoldMode } from './folding/xml.js';
import { FoldMode as CStyleFoldMode } from './folding/cstyle.js';

var Mode = function() {
    XmlMode.call(this);
    
    this.HighlightRules = SvgHighlightRules;
    
    this.createModeDelegates({
        "js-": JavaScriptMode
    });
    
    this.foldingRules = new MixedFoldMode(new XmlFoldMode(), {
        "js-": new CStyleFoldMode()
    });
};

oop.inherits(Mode, XmlMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };
    

    this.$id = "ace/mode/svg";
}).call(Mode.prototype);

export { Mode };
