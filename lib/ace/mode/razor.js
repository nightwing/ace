
"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { RazorHighlightRules } from './razor_highlight_rules';
import { RazorCompletions } from './razor_completions';
import { HtmlCompletions } from './html_completions';

var Mode = function() {
    HtmlMode.call(this);
    this.$highlightRules = new RazorHighlightRules();
    this.$completer = new RazorCompletions();
    this.$htmlCompleter = new HtmlCompletions();
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.getCompletions = function(state, session, pos, prefix) {
        var razorToken = this.$completer.getCompletions(state, session, pos, prefix);
        var htmlToken = this.$htmlCompleter.getCompletions(state, session, pos, prefix);
        return razorToken.concat(htmlToken);
    };
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/razor";
}).call(Mode.prototype);

export { Mode };
