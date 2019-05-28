
"use strict";

import oop from '../lib/oop.js';
import { TextHighlightRules } from './text_highlight_rules.js';

var GcodeHighlightRules = function() {

    var keywords = (
        "IF|DO|WHILE|ENDWHILE|CALL|ENDIF|SUB|ENDSUB|GOTO|REPEAT|ENDREPEAT|CALL"
        );

    var builtinConstants = (
        "PI"
        );

    var builtinFunctions = (
        "ATAN|ABS|ACOS|ASIN|SIN|COS|EXP|FIX|FUP|ROUND|LN|TAN"
        );
    var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants
    }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "\\(.*\\)"
        }, {
            token : "comment",           // block number
            regex : "([N])([0-9]+)"
        }, {
            token : "string",           // " string
            regex : "([G])([0-9]+\\.?[0-9]?)"
        }, {
            token : "string",           // ' string
            regex : "([M])([0-9]+\\.?[0-9]?)"
        }, {
            token : "constant.numeric", // float
            regex : "([-+]?([0-9]*\\.?[0-9]+\\.?))|(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)"
        }, {
            token : keywordMapper,
            regex : "[A-Z]"
        }, {
            token : "keyword.operator",
            regex : "EQ|LT|GT|NE|GE|LE|OR|XOR"
        }, {
            token : "paren.lparen",
            regex : "[\\[]"
        }, {
            token : "paren.rparen",
            regex : "[\\]]"
        }, {
            token : "text",
            regex : "\\s+"
        } ]
    };
};

oop.inherits(GcodeHighlightRules, TextHighlightRules);

export { GcodeHighlightRules };
