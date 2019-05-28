
"use strict";

import oop from '../lib/oop.js';
import { Mode as TextMode } from './text.js';
import { CsoundDocumentHighlightRules } from './csound_document_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = CsoundDocumentHighlightRules;
};
oop.inherits(Mode, TextMode);

export { Mode };
