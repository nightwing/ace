
"use strict";

import oop from '../lib/oop.js';
import { Mode as HtmlMode } from './html.js';
import { Mode as LuaMode } from './lua.js';
import { LuaPageHighlightRules } from './luapage_highlight_rules.js';

var Mode = function() {
    HtmlMode.call(this);
    
    this.HighlightRules = LuaPageHighlightRules;
    this.createModeDelegates({
        "lua-": LuaMode
    });
};
oop.inherits(Mode, HtmlMode);

(function() {
    this.$id = "ace/mode/luapage";
}).call(Mode.prototype);

export { Mode };
