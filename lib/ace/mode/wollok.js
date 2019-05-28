
"use strict";

import oop from '../lib/oop';
import { Mode as JavaScriptMode } from './javascript';
import { WollokHighlightRules } from './wollok_highlight_rules';

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = WollokHighlightRules;
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/wollok";
}).call(Mode.prototype);

export { Mode };
