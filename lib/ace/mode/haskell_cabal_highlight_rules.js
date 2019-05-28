
 /**
 * Haskell Cabal files highlighter (https://www.haskell.org/cabal/users-guide/developing-packages.html)
 **/

 "use strict";

 import oop from '../lib/oop.js';
 import { TextHighlightRules } from './text_highlight_rules.js';

 var CabalHighlightRules = function() {

     // regexp must not have capturing parentheses. Use (?:) instead.
     // regexps are ordered -> the first match is used
     this.$rules = {
         "start" : [
             {
                 token : "comment",
                 regex : "^\\s*--.*$"
             }, {
                 token: ["keyword"],
                 regex: /^(\s*\w.*?)(:(?:\s+|$))/
             }, {
                 token : "constant.numeric", // float
                 regex : /[\d_]+(?:(?:[\.\d_]*)?)/
             }, {
                 token : "constant.language.boolean",
                 regex : "(?:true|false|TRUE|FALSE|True|False|yes|no)\\b"
             }, {
                 token : "markup.heading",
                 regex : /^(\w.*)$/
             }
         ]};

 };

 oop.inherits(CabalHighlightRules, TextHighlightRules);

 export { CabalHighlightRules };
