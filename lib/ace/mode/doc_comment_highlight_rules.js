
"use strict";

import oop from '../lib/oop';
import { TextHighlightRules } from './text_highlight_rules';

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        }, 
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


export { DocCommentHighlightRules };
