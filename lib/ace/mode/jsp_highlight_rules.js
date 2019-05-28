
"use strict";

import oop from '../lib/oop';
import { HtmlHighlightRules } from './html_highlight_rules';
import { JavaHighlightRules } from './java_highlight_rules';

var JspHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var builtinVariables = 'request|response|out|session|' +
            'application|config|pageContext|page|Exception';

    var keywords = 'page|include|taglib';

    var startRules = [
        {
            token : "comment",
            regex : "<%--",
            push : "jsp-dcomment"
        }, {
            token : "meta.tag", // jsp open tag
            regex : "<%@?|<%=?|<%!?|<jsp:[^>]+>",
            push  : "jsp-start"
        }
    ];

    var endRules = [
        {
            token : "meta.tag", // jsp close tag
            regex : "%>|<\\/jsp:[^>]+>",
            next  : "pop"
        }, {
            token: "variable.language",
            regex : builtinVariables
        }, {
            token: "keyword",
            regex : keywords
        }
    ];

    for (var key in this.$rules)
        this.$rules[key].unshift.apply(this.$rules[key], startRules);

    this.embedRules(JavaHighlightRules, "jsp-", endRules, ["start"]);

    this.addRules({
        "jsp-dcomment" : [{
            token : "comment",
            regex : ".*?--%>",
            next : "pop"
        }]
    });

    this.normalizeRules();
};

oop.inherits(JspHighlightRules, HtmlHighlightRules);

export { JspHighlightRules };
