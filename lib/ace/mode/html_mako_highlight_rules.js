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

var HTMLMakoHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        start: [{
            token: ["keyword.control", "source.mako.substitution"],
            regex: /(<%)( )/,
            push: [{
                token: "keyword.control",
                regex: /%>/,
                next: "pop"
            }, {
                include: "source.python"
            }, {
                defaultToken: "source.mako.substitution"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python",
                "keyword.control"
            ],
            regex: /(<%)(text)(>)/,
            push: [{
                token: [
                    "keyword.control",
                    "storage.type.function.python",
                    "keyword.control"
                ],
                regex: /(<\/%)(text)(>)/,
                next: "pop"
            }, {
                defaultToken: "source.mako.text"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python",
                "keyword.control"
            ],
            regex: /(<%)(doc)(>)/,
            push: [{
                token: [
                    "keyword.control",
                    "storage.type.function.python",
                    "keyword.control"
                ],
                regex: /(<\/%)(doc)(>)/,
                next: "pop"
            }, {
                defaultToken: "source.mako.doc"
            }]
        }, {
            token: "keyword.control",
            regex: /\${/,
            push: [{
                token: "keyword.control",
                regex: /}/,
                next: "pop"
            }, {
                include: "source.python"
            }, {
                defaultToken: "source.mako.expression"
            }]
        }, {
            token: [
                "source.doc.python.mako.controlline",
                "keyword.control",
                "keyword.control"
            ],
            regex: /^(\s*)(%)((?:\s*(?:endfor|endif|endwhile))?)/,
            push: [{
                token: "source.doc.python.mako.controlline",
                regex: /$/,
                next: "pop"
            }, {
                include: "source.python"
            }, {
                defaultToken: "source.doc.python.mako.controlline"
            }]
        }, {
            token: "keyword.control",
            regex: /^#/,
            push: [{
                token: "source.python.mako.line",
                regex: /$/,
                next: "pop"
            }, {
                include: "comment.block"
            }, {
                defaultToken: "source.python.mako.line"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python",
                "keyword.control"
            ],
            regex: /(<%)(def)(\S?)/,
            push: [{
                token: [
                    "keyword.control",
                    "storage.type.function.python",
                    "keyword.control"
                ],
                regex: /(<\/%)(def)(>)/,
                next: "pop"
            }, {
                token: "text",
                regex: "(?<=<%def)",
                TODO: "FIXME: regexp doesn't have js equivalent",
                originalRegex: "(?<=<%def)",
                push: [{
                    token: "text",
                    regex: /(?=>)/,
                    next: "pop"
                }, {
                    token: [
                        "keyword.control",
                        "text",
                        "keyword.operator",
                        "text",
                        "punctuation.section.function.begin.python"
                    ],
                    regex: /(name)(\s*)(=)(\s*)(")(?=[A-Za-z_][A-Za-z0-9_]*)/,
                    push: [{
                        token: "punctuation.section.function.begin.python",
                        regex: /"/,
                        next: "pop"
                    }, {
                        include: "#function_def"
                    }, {
                        include: "#entity_name"
                    }, {
                        defaultToken: "entity.name.function.python"
                    }]
                }, {
                    include: "#tag-stuff"
                }]
            }, {
                todo: {
                    token: "keyword.control",
                    regex: />/,
                    push: [{
                        token: [],
                        regex: /(?=<\/%def>)/,
                     }, {
                        include: "$self"
                    }]
                }
            }, {
                defaultToken: "source.mako.def"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python"
            ],
            regex: /(<%)(call)/,
            push: [{
                token: [
                    "keyword.control",
                    "storage.type.function.python",
                    "keyword.control"
                ],
                regex: /(<\/%)(call)(>)/,
                next: "pop"
            }, {
                token: [
                    "keyword.control",
                    "text",
                    "keyword.operator",
                    "text",
                    "punctuation.section.function.begin.python"
                ],
                regex: /(expr)(\s*)(=)(\s*)(")/,
                push: [{
                    token: "punctuation.section.function.begin.python",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "source.python"
                }]
            }, {
                todo: {
                    token: "keyword.control",
                    regex: />/,
                    push: [{
                        token: [],
                        regex: /(?=<\/%call>)/,
                        next: "pop"
                    }, {
                        include: "$self"
                    }]
                }
            }, {
                defaultToken: "source.mako.call"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python",
                "source.mako.inherit"
            ],
            regex: /(<%)(inherit|namespace|include)( )/,
            push: [{
                token: "keyword.control",
                regex: /\/>/,
                next: "pop"
            }, {
                include: "#tag-stuff"
            }, {
                defaultToken: "source.mako.inherit"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python"
            ],
            regex: /(<%)(page)/,
            push: [{
                token: "keyword.control",
                regex: /\/>/,
                next: "pop"
            }, {
                token: [
                    "keyword.control",
                    "text",
                    "keyword.operator",
                    "text",
                    "punctuation.section.function.begin.python"
                ],
                regex: /(args)(\s*)(=)(\s*)(")/,
                push: [{
                    token: "punctuation.section.function.end.python",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "#positional_args"
                }, {
                    include: "#keyword_arguments"
                }]
            }, {
                include: "#tag-stuff"
            }, {
                defaultToken: "source.mako.page"
            }]
        }, {
            token: [
                "keyword.control",
                "storage.type.function.python"
            ],
            regex: /(<%)([a-zA-Z:]+)/,
            push: [{
                token: "keyword.control",
                regex: /<\/%[a-zA-Z:]+>|\/>/,
                next: "pop"
            }, {
                token: [
                    "keyword.control",
                    "text",
                    "keyword.operator",
                    "text",
                    "punctuation.section.function.begin.python"
                ],
                regex: /(expr)(\s*)(=)(\s*)(")/,
                push: [{
                    token: "punctuation.section.function.begin.python",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "source.python"
                }]
            }, {
                todo: {
                    token: "keyword.control",
                    regex: />/,
                    push: [{
                        token: [],
                        regex: /(?=<\/%[a-zA-Z:]+>)/,
                        next: "pop"
                    }, {
                        include: "$self"
                    }]
                }
            }, {
                include: "#tag-stuff"
            }, {
                defaultToken: "source.mako.genericcall"
            }]
        }, {
            include: "text.html.basic"
        }],
        "#builtin_exceptions": [{
            token: "support.type.exception.python",
            regex: /\b(?:(?:Arithmetic|Assertion|Attribute|EOF|Environment|FloatingPoint|IO|Import|Indentation|Index|Key|Lookup|Memory|Name|OS|Overflow|NotImplemented|Reference|Runtime|Standard|Syntax|System|Tab|Type|UnboundLocal|Unicode(?:Translate|Encode|Decode)?|Value|ZeroDivision)Error|(?:Deprecation|Future|Overflow|PendingDeprecation|Runtime|Syntax|User)?Warning|KeyboardInterrupt|NotImplemented|StopIteration|SystemExit|(?:Base)?Exception)\b/
        }],
        "#builtin_functions": [{
            token: "support.function.builtin.python",
            regex: /\b(?:__import__|all|abs|any|apply|callable|chr|cmp|coerce|compile|delattr|dir|divmod|eval|execfile|filter|getattr|globals|hasattr|hash|hex|id|input|intern|isinstance|issubclass|iter|len|locals|map|max|min|oct|ord|pow|range|raw_input|reduce|reload|repr|round|setattr|sorted|sum|unichr|vars|zip)\b/
        }],
        "#builtin_types": [{
            token: "support.type.python",
            regex: /\b(?:basestring|bool|buffer|classmethod|complex|dict|enumerate|file|float|frozenset|int|list|long|object|open|property|reversed|set|slice|staticmethod|str|super|tuple|type|unicode|xrange)\b/
        }],
        "#constant_placeholder": [{
            token: "constant.other.placeholder.python",
            regex: /%(?:\([a-z_]+\))?#?0?\-?[ ]?\+?(?:[0-9]*|\*)(?:\.(?:[0-9]*|\*))?[hL]?[a-z%]/,
            caseInsensitive: true
        }],
        "#dotted_entity_name": [{
            token: "text",
            regex: /(?=[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)/,
            push: [{
                token: "text",
                regex: "(?<=[A-Za-z0-9_])",
                TODO: "FIXME: regexp doesn't have js equivalent",
                originalRegex: "(?<=[A-Za-z0-9_])",
                next: "pop"
            }, {
                token: "text",
                regex: /(?=[A-Za-z_][A-Za-z0-9_]*)/,
                push: [{
                    token: "text",
                    regex: "(?<=[A-Za-z0-9_])",
                    TODO: "FIXME: regexp doesn't have js equivalent",
                    originalRegex: "(?<=[A-Za-z0-9_])",
                    next: "pop"
                }, {
                    include: "#entity_name"
                }]
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
        "#entity_name": [{
            token: "text",
            regex: /(?=[A-Za-z_][A-Za-z0-9_]*)/,
            push: [{
                token: "text",
                regex: "(?<=[A-Za-z0-9_])",
                TODO: "FIXME: regexp doesn't have js equivalent",
                originalRegex: "(?<=[A-Za-z0-9_])",
                next: "pop"
            }, {
                include: "#magic_function_names"
            }, {
                include: "#magic_variable_names"
            }, {
                include: "#illegal_names"
            }, {
                include: "#builtin_exceptions"
            }, {
                include: "#builtin_functions"
            }, {
                include: "#builtin_types"
            }, {
                include: "#generic_name"
            }]
        }],
        "#escaped_char": [{
            token: "constant.character.escape.python",
            regex: /\\[.$]/
        }],
        "#function_def": [{
            token: "punctuation.section.parameters.begin.python",
            regex: /\(/,
            push: [{
                token: [
                    "punctuation.section.parameters.end.python",
                    "text"
                ],
                regex: /(\))(\s*)(?=\")/,
                next: "pop"
            }, {
                include: "#keyword_arguments"
            }, {
                include: "#positional_args"
            }, {
                defaultToken: "meta.function.parameters.python"
            }]
        }],
        "#function_name": [{
            token: "text",
            regex: /(?=[A-Za-z_][A-Za-z0-9_]*)/,
            push: [{
                token: "text",
                regex: "(?<=[A-Za-z0-9_])",
                TODO: "FIXME: regexp doesn't have js equivalent",
                originalRegex: "(?<=[A-Za-z0-9_])",
                next: "pop"
            }, {
                include: "#magic_function_names"
            }, {
                include: "#magic_variable_names"
            }, {
                include: "#builtin_exceptions"
            }, {
                include: "#builtin_functions"
            }, {
                include: "#builtin_types"
            }, {
                include: "#generic_name"
            }]
        }],
        "#generic_name": [{
            token: "text",
            regex: /[A-Za-z_][A-Za-z0-9_]*/
        }],
        "#illegal_names": [{
            token: "invalid.illegal.name.python",
            regex: /\b(?:and|as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|raise|return|try|while|with|yield)\b/
        }],
        "#keyword_arguments": [{
            token: [
                "variable.parameter.function.python",
                "text",
                "keyword.operator.assignment.python"
            ],
            regex: /\b([a-zA-Z_][a-zA-Z_0-9]*)(\s*)(=)/,
            push: [{
                token: [
                    "text",
                    "punctuation.separator.parameters.python"
                ],
                regex: /(\s*)(?:(,)|(?=$|[\)"]))/,
                next: "pop"
            }, {
                include: "$base"
            }]
        }],
        "#line_continuation": [{
            token: [
                "punctuation.separator.continuation.line.python",
                "invalid.illegal.unexpected-text.python"
            ],
            regex: /(\\)(.*)$/
        }],
        "#magic_function_names": [{
            token: "entity.name.function.magic.python",
            regex: /\b__(?:abs|add|and|call|cmp|coerce|complex|contains|del|delattr|delete|delitem|delslice|div|divmod|enter|eq|exit|float|floordiv|ge|get|getattr|getattribute|getitem|getslice|gt|hash|hex|iadd|iand|idiv|ifloordiv|ilshift|imod|imul|init|int|invert|ior|ipow|irshift|isub|iter|itruediv|ixor|le|len|long|lshift|lt|mod|mul|ne|neg|new|nonzero|oct|or|pos|pow|radd|rand|rdiv|rdivmod|repr|rfloordiv|rlshift|rmod|rmul|ror|rpow|rrshift|rshift|rsub|rtruediv|rxor|set|setattr|setitem|setslice|str|sub|truediv|unicode|xor)__\b/,
            comment: "these methods have magic interpretation by python and are generally called indirectly through syntactic constructs"
        }],
        "#magic_variable_names": [{
            token: "support.variable.magic.python",
            regex: /\b__(?:all|bases|class|debug|dict|doc|file|members|metaclass|methods|name|slots|weakref)__\b/,
            comment: "magic variables which a class/module may have."
        }],
        "#positional_args": [{
            token: [
                "variable.parameter.function.python",
                "text",
                "punctuation.separator.parameters.python"
            ],
            regex: /\b([a-zA-Z_][a-zA-Z_0-9]*)(\s*)(?:(,)|(?=[$\)"]))/
        }],
        "#source_mako_tagargs": [{
            token: [
                "keyword.control",
                "text",
                "keyword.operator",
                "text",
                "punctuation.section.function.begin.python"
            ],
            regex: /(name)(\s*)(=)(\s*)(")(?=[A-Za-z_][A-Za-z0-9_]*)/,
            push: [{
                token: "punctuation.section.function.begin.python",
                regex: /"/,
                next: "pop"
            }, {
                include: "#function_def"
            }, {
                include: "#entity_name"
            }, {
                defaultToken: "entity.name.function.python"
            }]
        }, {
            include: "#tag-stuff"
        }],
        "#string-double-quoted": [{
            token: "punctuation.definition.string.begin.html",
            regex: /"/,
            push: [{
                token: "punctuation.definition.string.end.html",
                regex: /"/,
                next: "pop"
            }, {
                include: "#embedded-code"
            }, {
                include: "#entities"
            }, {
                defaultToken: "string.quoted.double.html"
            }]
        }],
        "#string-single-quoted": [{
            token: "punctuation.definition.string.begin.html",
            regex: /'/,
            push: [{
                token: "punctuation.definition.string.end.html",
                regex: /'/,
                next: "pop"
            }, {
                include: "#embedded-code"
            }, {
                include: "#entities"
            }, {
                defaultToken: "string.quoted.single.html"
            }]
        }],
        "#tag-generic-attribute": [{
            token: "entity.other.attribute-name.html",
            regex: /\b[a-zA-Z\-_:]+/
        }],
        "#tag-id-attribute": [{
            token: [
                "entity.other.attribute-name.id.html",
                "meta.attribute-with-value.id.html",
                "punctuation.separator.key-value.html"
            ],
            regex: /\b(id)\b(\s*)(=)/,
            push: [{
                token: [],
                regex: "(?<='|\")",
                TODO: "FIXME: regexp doesn't have js equivalent",
                originalRegex: "(?<='|\")",
                next: "pop"
            }, {
                token: "punctuation.definition.string.begin.html",
                regex: /"/,
                push: [{
                    token: "punctuation.definition.string.end.html",
                    regex: /"/,
                    next: "pop"
                }, {
                    include: "#embedded-code"
                }, {
                    include: "#entities"
                }, {
                    defaultToken: "string.quoted.double.html"
                }]
            }, {
                token: "punctuation.definition.string.begin.html",
                regex: /'/,
                push: [{
                    token: "punctuation.definition.string.end.html",
                    regex: /'/,
                    next: "pop"
                }, {
                    include: "#embedded-code"
                }, {
                    include: "#entities"
                }, {
                    defaultToken: "string.quoted.single.html"
                }]
            }, {
                defaultToken: "meta.attribute-with-value.id.html"
            }]
        }],
        "#tag-stuff": [{
            include: "#tag-id-attribute"
        }, {
            include: "#tag-generic-attribute"
        }, {
            include: "#string-double-quoted"
        }, {
            include: "#string-single-quoted"
        }]
    }
    this.$rules = {
        start: [{
            regex: ".+", token: ""
        }]
    }  
    this.normalizeRules();
};


oop.inherits(HTMLMakoHighlightRules, TextHighlightRules);

exports.HTMLMakoHighlightRules = HTMLMakoHighlightRules;
});