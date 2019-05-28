
"use strict";

import oop from '../lib/oop';
import { Mode as JavaScriptMode } from './javascript';
import { JavaHighlightRules } from './java_highlight_rules';
import { FoldMode as JavaFoldMode } from './folding/java';

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = JavaHighlightRules;
    this.foldingRules = new JavaFoldMode();
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/java";
}).call(Mode.prototype);

export { Mode };
