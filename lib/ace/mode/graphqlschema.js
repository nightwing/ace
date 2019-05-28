
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { GraphQLSchemaHighlightRules } from './graphqlschema_highlight_rules.js';
import { FoldMode } from './folding/cstyle.js';

var Mode = function() {
    this.HighlightRules = GraphQLSchemaHighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "#";
    this.$id = "ace/mode/graphqlschema";
}).call(Mode.prototype);

export { Mode };
