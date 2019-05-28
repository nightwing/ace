
"use strict";

import oop from '../lib/oop';
import { TextHighlightRules } from './text_highlight_rules';

var GraphQLSchemaHighlightRules = function() {

    var keywords = (
      "type|interface|union|enum|schema|input|implements|extends|scalar"
    );

    var dataTypes = (
      "Int|Float|String|ID|Boolean"
    );

    var keywordMapper = this.createKeywordMapper({
        "keyword": keywords,
        "storage.type": dataTypes
    }, "identifier");

    this.$rules = {
      "start" : [ {
        token : "comment",
        regex : "#.*$"
      }, {
        token : "paren.lparen",
        regex : /[\[({]/,
        next  : "start"
      }, {
        token : "paren.rparen",
        regex : /[\])}]/
      }, {
        token : keywordMapper,
        regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
      } ]
    };
    this.normalizeRules();
};

oop.inherits(GraphQLSchemaHighlightRules, TextHighlightRules);

export { GraphQLSchemaHighlightRules };
