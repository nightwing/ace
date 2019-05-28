
"use strict";

import oop from '../lib/oop';
import { HtmlHighlightRules } from './html_highlight_rules';
import { JavaScriptHighlightRules } from './javascript_highlight_rules';

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


import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { Mode as JavaScriptMode } from './javascript';
import { Mode as CssMode } from './css';
import { Mode as RubyMode } from './ruby';

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
