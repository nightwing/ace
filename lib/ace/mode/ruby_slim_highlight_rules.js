/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */


define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var RubySlimHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        start: [{
            token: [
                "source.js.filter.slim",
                "constant.language.name.javascript.filter.slim",
                "source.js.filter.slim"
            ],
            regex: /^(\s*)(javascript)(:$)/,
            // push: [{
            //     token: "source.js.filter.slim",
            //     regex: /^(?!\s*\s|\s*$)/,
            //     next: "pop"
            // }, {
            //     include: "source.js"
            // }, {
            //     defaultToken: "source.js.filter.slim"
            // }]
        }, {
            token: [
                "storage.frontmatter.slim",
                "source.yaml.meta.slim"
            ],
            regex: /^(---)(\s*$)/,
            push: [{
                token: [
                    "storage.frontmatter.slim",
                    "source.yaml.meta.slim"
                ],
                regex: /^(---)(\s*$)/,
                next: "pop"
            }, {
                include: "source.yaml"
            }, {
                defaultToken: "source.yaml.meta.slim"
            }]
        }, {
            token: [
                "text.less.filter.slim",
                "constant.language.name.less.filter.slim",
                "text.less.filter.slim"
            ],
            regex: /^(\s*)(less)(:$)/,
            push: [{
                token: "text.less.filter.slim",
                regex: /^(?!\s*\s|\s*$)/,
                next: "pop"
            }, {
                include: "source.less"
            }, {
                defaultToken: "text.less.filter.slim"
            }]
        }, {
            token: [
                "text.erb.filter.slim",
                "constant.language.name.erb.filter.slim",
                "text.erb.filter.slim"
            ],
            regex: /^(\s*)(erb)(:$)/,
            push: [{
                token: "text.erb.filter.slim",
                regex: /^(?!\s*\s|\s*$)/,
                next: "pop"
            }, {
                include: "source.erb"
            }, {
                defaultToken: "text.erb.filter.slim"
            }]
        }, {
            token: [
                "punctuation.definition.prolog.slim",
                "meta.prolog.slim"
            ],
            regex: /^(! )($|\s.*)/
        }, {
            token: [
                "punctuation.section.comment.slim",
                "comment.block.slim",
                "comment.block.slim"
            ],
            regex: /^(\s*)(\/)(\s*.*$)/,
            push: [{
                token: "comment.block.slim",
                regex: /^(?!\s*  )/,
                next: "pop"
            }, {
                defaultToken: "comment.block.slim"
            }]
        }, {
            token: [
                "comment.line.slash.slim",
                "punctuation.section.comment.slim",
                "comment.line.slash.slim"
            ],
            regex: /^(\s*)(\/)(\s*\S.*$)/
        }, {
            token: "text",
            regex: /^\s*(?=-)/,
            push: [{
                token: "text",
                regex: /$/,
                next: "pop"
            }, {
                include: "#rubyline"
            }]
        }, {
            token: "text",
            regex: /(?==+|~)/,
            push: [{
                token: "text",
                regex: /$/,
                next: "pop"
            }, {
                include: "#rubyline"
            }]
        }, {
            include: "#tag-attribute"
        }, {
            include: "#embedded-ruby"
        }, {
            token: [
                "meta.tag",
                "entity.name.tag.slim",
                "entity.other.attribute-name.event.slim"
            ],
            regex: /^(\s*)(\.|#|[a-zA-Z0-9]+)((?:[\w-]+)?)/,
            push: [{
                token: [],
                regex: /$|(?!\.|#|=|:|-|~|\/|\}|\]|\*|\s?[\*\{])/,
                next: "pop"
            }, {
                token: "entity.name.tag.slim",
                regex: /(?::[\w\d]+)+/,
                push: [{
                    token: "entity.name.tag.slim",
                    regex: /$|\s/,
                    next: "pop"
                }, {
                    defaultToken: "entity.name.tag.slim"
                }],
                comment: "XML"
            }, {
                token: [
                    "punctuation.definition.tag.end.slim",
                    "entity.name.tag.slim",
                    "entity.other.attribute-name.event.slim"
                ],
                regex: /(:\s)(\.|#|[a-zA-Z0-9]+)((?:[\w-]+)?)/,
                push: [{
                    token: [],
                    regex: /$|(?!\.|#|=|-|~|\/|\}|\]|\*|\s?[\*\{])/,
                    next: "pop"
                }, {
                    include: "#root-class-id-tag"
                }, {
                    include: "#tag-attribute"
                }],
                comment: "Inline HTML / 1 - colon; 2 - dot OR hash OR any combination of word, number; 3 - OPTIONAL any combination of word, number, dash or underscore (following a . or"
            }, {
                token: "punctuation.section.embedded.ruby",
                regex: /\*\{(?=.*\}|.*\|\s*$)/,
                push: [{
                    token: "punctuation.section.embedded.ruby",
                    regex: /\}|$|^(?!.*\|\s*$)/,
                    next: "pop"
                }, {
                    include: "#embedded-ruby"
                }, {
                    defaultToken: "source.ruby.embedded.slim"
                }],
                comment: "Splat attributes"
            }, {
                include: "#root-class-id-tag"
            }, {
                include: "#rubyline"
            }, {
                token: "punctuation.terminator.tag.slim",
                regex: /\//
            }, {
                defaultToken: "meta.tag"
            }],
            comment: "1 - dot OR hash OR any combination of word, number; 2 - OPTIONAL any combination of word, number, dash or underscore (following a . or"
        }, {
            token: ["text", "meta.escape.slim"],
            regex: /^(\s*)(\\.)/
        }, {
            token: "text",
            regex: /^\s*(?=\||')/,
            push: [{
                token: "text",
                regex: /$/,
                next: "pop"
            }, {
                include: "#embedded-ruby"
            }, {
                include: "text.html.basic"
            }]
        }, {
            token: "text",
            regex: /(?=<[\w\d\:]+)/,
            push: [{
                token: "text",
                regex: /$|\/\>/,
                next: "pop"
            }, {
                include: "text.html.basic"
            }],
            comment: "Inline and root-level HTML tags"
        }],
        "#continuation": [{
            token: [
                "punctuation.separator.continuation.slim",
                "text"
            ],
            regex: /([\\,])(\s*$)/
        }],
        "#delimited-ruby-a": [{
            token: "source.ruby.embedded.slim",
            regex: /=\(/,
            push: [{
                token: "source.ruby.embedded.slim",
                regex: /\)(?=(?: \w|$))/,
                next: "pop"
            }, {
                include: "source.ruby.rails"
            }, {
                defaultToken: "source.ruby.embedded.slim"
            }]
        }],
        "#delimited-ruby-b": [{
            token: "source.ruby.embedded.slim",
            regex: /=\[/,
            push: [{
                token: "source.ruby.embedded.slim",
                regex: /\](?=(?: \w|$))/,
                next: "pop"
            }, {
                include: "source.ruby.rails"
            }, {
                defaultToken: "source.ruby.embedded.slim"
            }]
        }],
        "#delimited-ruby-c": [{
            token: "source.ruby.embedded.slim",
            regex: /=\{/,
            push: [{
                token: "source.ruby.embedded.slim",
                regex: /\}(?=(?: \w|$))/,
                next: "pop"
            }, {
                include: "source.ruby.rails"
            }, {
                defaultToken: "source.ruby.embedded.slim"
            }]
        }],
        "#embedded-ruby": [{
            token: "punctuation.section.embedded.ruby",
            regex: "#\\{{1,2}",
            push: [{
                token: "punctuation.section.embedded.ruby",
                regex: /\}{1,2}/,
                next: "pop"
            }, {
                include: "source.ruby.rails"
            }, {
                defaultToken: "source.ruby.embedded.html"
            }]
        }],
        "#entities": [{
            token: [
                "punctuation.definition.entity.html",
                "constant.character.entity.html",
                "punctuation.definition.entity.html"
            ],
            regex: /(&)([a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+)(;)/
        }, {
            token: "invalid.illegal.bad-ampersand.html",
            regex: /&/
        }],
        "#interpolated-ruby": [{
            token: "source.ruby.embedded.html",
            regex: /=(?=\b)/,
            push: [{
                token: "source.ruby.embedded.html",
                regex: /\s|\w$/,
                next: "pop"
            }, {
                defaultToken: "source.ruby.embedded.html"
            }]
        }],
        "#root-class-id-tag": [{
            token: [
                "punctuation.separator.key-value.html",
                "entity.other.attribute-name.html"
            ],
            regex: /(\.|#)([\w\d\-]+)/
        }],
        "#rubyline": [{
            token: "meta.line.ruby.slim",
            regex: /(?:==|=)(?:<>|><|<'|'<|<|>)?|-/,
            push: [{
                regex: "(?:\\\\|,|,$|\\\\$)$",
                token: "meta.line.ruby.slim"
            }, {
                token: "meta.line.ruby.slim",
                regex: "$",
                next: "pop"
            }, {
                token: "comment.line.number-sign.ruby",
                regex: /#.*$/,
                comment: "Hack to let ruby comments work in this context properly"
            }, {
                include: "#continuation"
            }, {
                include: "source.ruby.rails"
            }, {
                defaultToken: "meta.line.ruby.slim"
            }]
        }],
        "#string-double-quoted": [{
            token: "punctuation.definition.string.begin.html",
            regex: /"(?=.*")/,
            push: [{
                token: "punctuation.definition.string.end.html",
                regex: /"/,
                next: "pop"
            }, {
                include: "#embedded-ruby"
            }, {
                include: "#entities"
            }, {
                defaultToken: "string.quoted.double.html"
            }]
        }],
        "#string-single-quoted": [{
            token: "punctuation.definition.string.begin.html",
            regex: /'(?=.*')/,
            push: [{
                token: "punctuation.definition.string.end.html",
                regex: /'/,
                next: "pop"
            }, {
                include: "#embedded-ruby"
            }, {
                include: "#entities"
            }, {
                defaultToken: "string.quoted.single.html"
            }]
        }],
        "#tag-attribute": [{
            token: [
                "entity.other.attribute-name.event.slim",
                "text",
                "constant.language.slim",
                "text"
            ],
            regex: /([\w.#_-]+)(=)(?!\s)((?:true|false|nil)?)((?:\s*\(|\{)?)/,
            push: [{
                token: ["text", "text"],
                regex: /(\})|(\))|$/,
                next: "pop"
            }, {
                include: "#tag-stuff"
            }, {
                include: "#string-double-quoted"
            }, {
                include: "#string-single-quoted"
            }]
        }],
        "#tag-stuff": [{
            include: "#tag-attribute"
        }, {
            include: "#interpolated-ruby"
        }, {
            include: "#delimited-ruby-a"
        }, {
            include: "#delimited-ruby-b"
        }, {
            include: "#delimited-ruby-c"
        }, {
            include: "#rubyline"
        }, {
            include: "#embedded-ruby"
        }]
    }
    
    this.normalizeRules();
};

RubySlimHighlightRules.metaData = {
    fileTypes: ["slim", "skim"],
    foldingStartMarker: "^\\s*([-%#\\:\\.\\w\\=].*)\\s$",
    foldingStopMarker: "^\\s*$",
    keyEquivalent: "^~S",
    name: "Ruby Slim",
    scopeName: "text.slim"
}


oop.inherits(RubySlimHighlightRules, TextHighlightRules);

exports.RubySlimHighlightRules = RubySlimHighlightRules;
});