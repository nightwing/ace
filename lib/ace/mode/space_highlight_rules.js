
"use strict";

import oop from '../lib/oop';
import { TextHighlightRules } from './text_highlight_rules';

var SpaceHighlightRules = function() {

    // Todo: support multiline values that escape the newline with spaces.
    this.$rules = {
        "start" : [
            {
                token : "empty_line",
                regex : / */,
                next : "key"
            },
            {
                token : "empty_line",
                regex : /$/,
                next : "key"
            }
        ],
        "key" : [
            {
                token : "variable",
                regex : /\S+/
            },
            {
                token : "empty_line",
                regex : /$/,
                next : "start"
            },{
                token : "keyword.operator",
                regex : / /,
                next  : "value"
            }
        ],
        "value" : [
            {
                token : "keyword.operator",
                regex : /$/,
                next  : "start"
            },
            {
                token : "string",
                regex : /[^$]/
            }
        ]
    };
    
};

oop.inherits(SpaceHighlightRules, TextHighlightRules);

export { SpaceHighlightRules };
