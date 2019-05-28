
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CsoundDocumentHighlightRules } from './csound_document_highlight_rules';

var Mode = function() {
    this.HighlightRules = CsoundDocumentHighlightRules;
};
oop.inherits(Mode, TextMode);

export { Mode };
