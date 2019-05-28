
"use strict";

import oop from '../lib/oop';
import { Mode as XmlMode } from './xml';
import { Mode as JavaScriptMode } from './javascript';
import { SvgHighlightRules } from './svg_highlight_rules';
import { FoldMode as MixedFoldMode } from './folding/mixed';
import { FoldMode as XmlFoldMode } from './folding/xml';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

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
