
"use strict";

import oop from '../lib/oop';
import { Mode as JavaScriptMode } from './javascript';
import { ScalaHighlightRules } from './scala_highlight_rules';

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = ScalaHighlightRules;
};
oop.inherits(Mode, JavaScriptMode);

(function() {

    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/scala";
}).call(Mode.prototype);

export { Mode };
