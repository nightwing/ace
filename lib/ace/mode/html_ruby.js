
"use strict";

import oop from '../lib/oop.js';
import { HtmlRubyHighlightRules } from './html_ruby_highlight_rules.js';
import { Mode as HtmlMode } from './html.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { Mode as CssMode } from './css.js';
import { Mode as RubyMode } from './ruby.js';

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
