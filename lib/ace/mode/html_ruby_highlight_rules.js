
"use strict";

import oop from '../lib/oop.js';
import { HtmlHighlightRules } from './html_highlight_rules.js';
import { RubyHighlightRules } from './ruby_highlight_rules.js';

var HtmlRubyHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var startRules = [
        {
            regex: "<%%|%%>",
            token: "constant.language.escape"
        }, {
            token : "comment.start.erb",
            regex : "<%#",
            push  : [{
                token : "comment.end.erb",
                regex: "%>",
                next: "pop",
                defaultToken:"comment"
            }]
        }, {
            token : "support.ruby_tag",
            regex : "<%+(?!>)[-=]?",
            push  : "ruby-start"
        }
    ];

    var endRules = [
        {
            token : "support.ruby_tag",
            regex : "%>",
            next  : "pop"
        }, {
            token: "comment",
            regex: "#(?:[^%]|%[^>])*"
        }
    ];

    for (var key in this.$rules)
        this.$rules[key].unshift.apply(this.$rules[key], startRules);

    this.embedRules(RubyHighlightRules, "ruby-", endRules, ["start"]);

    this.normalizeRules();
};


oop.inherits(HtmlRubyHighlightRules, HtmlHighlightRules);

export { HtmlRubyHighlightRules };
