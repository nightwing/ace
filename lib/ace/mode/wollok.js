
"use strict";

import oop from '../lib/oop.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { WollokHighlightRules } from './wollok_highlight_rules.js';

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
