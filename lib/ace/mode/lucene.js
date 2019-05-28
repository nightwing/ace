
'use strict';

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { LuceneHighlightRules } from './lucene_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = LuceneHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};

oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/lucene";
}).call(Mode.prototype);

export { Mode };
