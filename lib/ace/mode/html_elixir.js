
"use strict";

import oop from '../lib/oop';
import { HtmlElixirHighlightRules } from './html_elixir_highlight_rules';
import { Mode as HtmlMode } from './html';
import { Mode as JavaScriptMode } from './javascript';
import { Mode as CssMode } from './css';
import { Mode as ElixirMode } from './elixir';

var Mode = function() {
    HtmlMode.call(this);   
    this.HighlightRules = HtmlElixirHighlightRules;
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode,
        "elixir-": ElixirMode
    });
};
oop.inherits(Mode, HtmlMode);

(function() {

    this.$id = "ace/mode/html_elixir";
}).call(Mode.prototype);

export { Mode };
