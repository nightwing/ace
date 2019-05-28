
"use strict";

import oop from '../lib/oop';
import { TextHighlightRules } from './text_highlight_rules';

var PropertiesHighlightRules = function() {

    var escapeRe = /\\u[0-9a-fA-F]{4}|\\/;

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : /[!#].*$/
            }, {
                // Empty value
                token : "keyword",
                regex : /[=:]$/
            }, {
                token : "keyword",
                regex : /[=:]/,
                next  : "value"
            }, {
                token : "constant.language.escape",
                regex : escapeRe
            }, {
                defaultToken: "variable"
            }
        ],
        "value" : [
            {
                // Multi-line string
                regex : /\\$/,
                token : "string",
                next : "value"
            }, {
                regex : /$/,
                token : "string",
                next : "start"
            }, {
                token : "constant.language.escape",
                regex : escapeRe
            }, {
                defaultToken: "string"
            }
        ]
    };

};

oop.inherits(PropertiesHighlightRules, TextHighlightRules);

export { PropertiesHighlightRules };
