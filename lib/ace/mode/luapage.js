
"use strict";

import oop from '../lib/oop';
import { Mode as HtmlMode } from './html';
import { Mode as LuaMode } from './lua';
import { LuaPageHighlightRules } from './luapage_highlight_rules';

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
