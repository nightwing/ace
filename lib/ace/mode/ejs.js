
"use strict";

import oop from '../lib/oop.js';
import { HtmlHighlightRules } from './html_highlight_rules.js';
import { JavaScriptHighlightRules } from './javascript_highlight_rules.js';

var EjsHighlightRules = function(start, end) {
    HtmlHighlightRules.call(this);
    
    if (!start)
        start = "(?:<%|<\\?|{{)";
    if (!end)
        end = "(?:%>|\\?>|}})";

    for (var i in this.$rules) {
        this.$rules[i].unshift({
            token : "markup.list.meta.tag",
            regex : start + "(?![>}])[-=]?",
            push  : "ejs-start"
        });
    }
    
    this.embedRules(new JavaScriptHighlightRules({jsx: false}).getRules(), "ejs-", [{
        token : "markup.list.meta.tag",
        regex : "-?" + end,
        next  : "pop"
    }, {
        token: "comment",
        regex: "//.*?" + end,
        next: "pop"
    }]);
    
    this.normalizeRules();
};


oop.inherits(EjsHighlightRules, HtmlHighlightRules);


import oop from '../lib/oop.js';
import { Mode as HtmlMode } from './html.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { Mode as CssMode } from './css.js';
import { Mode as RubyMode } from './ruby.js';

var Mode = function() {
    HtmlMode.call(this);
    this.HighlightRules = EjsHighlightRules;    
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode,
        "ejs-": JavaScriptMode
    });
};
oop.inherits(Mode, HtmlMode);

(function() {

    this.$id = "ace/mode/ejs";
}).call(Mode.prototype);

export { EjsHighlightRules, Mode };
