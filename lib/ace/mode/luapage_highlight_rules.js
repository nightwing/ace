// LuaPage implements the LuaPage markup as described by the Kepler Project's CGILua
// documentation: http://keplerproject.github.com/cgilua/manual.html#templates

"use strict";

import oop from '../lib/oop.js';
import { HtmlHighlightRules } from './html_highlight_rules.js';
import { LuaHighlightRules } from './lua_highlight_rules.js';

var LuaPageHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var startRules = [
        {
            token: "keyword",
            regex: "<\\%\\=?",
            push: "lua-start"
        }, {
            token: "keyword",
            regex: "<\\?lua\\=?",
            push: "lua-start"
        }
    ];

    var endRules = [
        {
            token: "keyword",
            regex: "\\%>",
            next: "pop"
        }, {
            token: "keyword",
            regex: "\\?>",
            next: "pop"
        }
    ];

    this.embedRules(LuaHighlightRules, "lua-", endRules, ["start"]);

    for (var key in this.$rules)
        this.$rules[key].unshift.apply(this.$rules[key], startRules);

    this.normalizeRules();
};

oop.inherits(LuaPageHighlightRules, HtmlHighlightRules);

export { LuaPageHighlightRules };
