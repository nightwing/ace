
"use strict";

import oop from '../lib/oop';
import { HtmlRubyHighlightRules } from './html_ruby_highlight_rules';
import { Mode as HtmlMode } from './html';
import { Mode as JavaScriptMode } from './javascript';
import { Mode as CssMode } from './css';
import { Mode as RubyMode } from './ruby';

var Mode = function() {
    HtmlMode.call(this);   
    this.HighlightRules = HtmlRubyHighlightRules;    
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode,
        "ruby-": RubyMode
    });
};
oop.inherits(Mode, HtmlMode);

(function() {

    this.$id = "ace/mode/html_ruby";
}).call(Mode.prototype);

export { Mode };
