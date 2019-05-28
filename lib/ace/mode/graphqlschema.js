
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { GraphQLSchemaHighlightRules } from './graphqlschema_highlight_rules';
import { FoldMode } from './folding/cstyle';

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
