
"use strict";

import oop from '../lib/oop';
import lang from '../lib/lang';
import { TextHighlightRules } from './text_highlight_rules';

var LuceneHighlightRules = function() {
    this.$rules = {
        "start" : [
            {
                token: "constant.language.escape",
                regex: /\\[\+\-&\|!\(\)\{\}\[\]^"~\*\?:\\]/
            }, {
                token: "constant.character.negation",
                regex: "\\-"
            }, {
                token: "constant.character.interro",
                regex: "\\?"
            }, {
                token: "constant.character.required",
                regex: "\\+"
            }, {
                token: "constant.character.asterisk",
                regex: "\\*"
            }, {
                token: 'constant.character.proximity',
                regex: '~(?:0\\.[0-9]+|[0-9]+)?'
            }, {
                token: 'keyword.operator',
                regex: '(AND|OR|NOT|TO)\\b'
            }, {
                token: "paren.lparen",
                regex: "[\\(\\{\\[]"
            }, {
                token: "paren.rparen",
                regex: "[\\)\\}\\]]"
            }, {
                token: "keyword",
                regex: "(?:\\\\.|[^\\s:\\\\])+:"
            }, {
                token: "string",           // " string
                regex: '"(?:\\\\"|[^"])*"'
            }, {
                token: "term",
                regex: "\\w+"
            }, {
                token: "text",
                regex: "\\s+"
            }
        ]
    };
};

oop.inherits(LuceneHighlightRules, TextHighlightRules);

export { LuceneHighlightRules };
