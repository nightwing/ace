
"use strict";

import oop from '../lib/oop.js';
import { HtmlElixirHighlightRules } from './html_elixir_highlight_rules.js';
import { Mode as HtmlMode } from './html.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { Mode as CssMode } from './css.js';
import { Mode as ElixirMode } from './elixir.js';

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
