
"use strict";

import oop from '../lib/oop.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { GroovyHighlightRules } from './groovy_highlight_rules.js';

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = GroovyHighlightRules;
};
oop.inherits(Mode, JavaScriptMode);

(function() {

    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/groovy";
}).call(Mode.prototype);

export { Mode };
