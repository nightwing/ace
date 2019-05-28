
'use strict';

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { LuceneHighlightRules } from './lucene_highlight_rules';

var Mode = function() {
    this.HighlightRules = LuceneHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};

oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/lucene";
}).call(Mode.prototype);

export { Mode };
