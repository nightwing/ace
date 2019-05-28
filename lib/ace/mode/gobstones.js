
"use strict";

import oop from '../lib/oop';
import { Mode as JavaScriptMode } from './javascript';
import { GobstonesHighlightRules } from './gobstones_highlight_rules';

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = GobstonesHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/gobstones";
}).call(Mode.prototype);

export { Mode };
