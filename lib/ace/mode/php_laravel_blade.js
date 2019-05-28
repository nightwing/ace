
"use strict";

import oop from '../lib/oop';
import { PHPLaravelBladeHighlightRules } from './php_laravel_blade_highlight_rules';
import { Mode as PHPMode } from './php';
import { Mode as JavaScriptMode } from './javascript';
import { Mode as CssMode } from './css';
import { Mode as HtmlMode } from './html';

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
