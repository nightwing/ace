
"use strict";

import oop from '../lib/oop.js';
import { PHPLaravelBladeHighlightRules } from './php_laravel_blade_highlight_rules.js';
import { Mode as PHPMode } from './php.js';
import { Mode as JavaScriptMode } from './javascript.js';
import { Mode as CssMode } from './css.js';
import { Mode as HtmlMode } from './html.js';

var Mode = function() {
    PHPMode.call(this);

    this.HighlightRules = PHPLaravelBladeHighlightRules;
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode,
        "html-": HtmlMode
    });
};
oop.inherits(Mode, PHPMode);

(function() {

    this.$id = "ace/mode/php_laravel_blade";
}).call(Mode.prototype);

export { Mode };
